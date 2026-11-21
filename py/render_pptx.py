"""场景 JSON → 原生可编辑 PPTX（python-pptx）
用法： python render_pptx.py scene.json out.pptx
场景坐标单位：px（1280×720 设计空间，1px = 9525 EMU = 0.75pt）
"""
import json
import sys

from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR, MSO_AUTO_SIZE
from pptx.enum.dml import MSO_LINE_DASH_STYLE
from pptx.oxml.ns import qn
from lxml import etree

PX = 9525  # EMU per px


def hexcolor(v):
    v = str(v or '#000000').strip()
    if v.startswith('rgba'):
        parts = v[v.find('(') + 1:v.find(')')].split(',')
        return RGBColor(int(parts[0]), int(parts[1]), int(parts[2]))
    v = v.lstrip('#')
    if len(v) == 3:
        v = ''.join(c * 2 for c in v)
    v = v[:6].ljust(6, '0')
    return RGBColor.from_string(v.upper())


def set_alpha(shape, alpha):
    """给纯色填充加透明度（python-pptx 没有直接 API）"""
    if alpha is None:
        return
    a = int(round(max(0.0, min(1.0, alpha)) * 100000))
    sp = shape.fill._xPr
    solid = sp.find(qn('a:solidFill'))
    if solid is None:
        return
    clr = solid[0]
    for old in clr.findall(qn('a:alpha')):
        clr.remove(old)
    alpha_el = etree.SubElement(clr, qn('a:alpha'))
    alpha_el.set('val', str(a))


def no_shadow(shape):
    """去掉主题继承的阴影与描边样式（模板风格是干净的扁平块面）"""
    try:
        shape.shadow.inherit = False
    except Exception:
        pass
    el = shape._element
    for style in el.findall(qn('p:style')):
        el.remove(style)


def dash_style(dash):
    if not dash:
        return None
    return MSO_LINE_DASH_STYLE.DASH


def add_text(slide, it):
    x, y, w, h = (it['x'] * PX, it['y'] * PX, it['w'] * PX, it['h'] * PX)
    box = slide.shapes.add_textbox(Emu(int(x)), Emu(int(y)), Emu(int(w)), Emu(int(h)))
    tf = box.text_frame
    tf.word_wrap = not it.get('noWrap', False)
    tf.auto_size = MSO_AUTO_SIZE.NONE
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = {'middle': MSO_ANCHOR.MIDDLE, 'bottom': MSO_ANCHOR.BOTTOM}.get(it.get('valign'), MSO_ANCHOR.TOP)
    lines = str(it.get('text', '')).split('\n')
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = {'center': PP_ALIGN.CENTER, 'right': PP_ALIGN.RIGHT}.get(it.get('align'), PP_ALIGN.LEFT)
        p.line_spacing = float(it.get('lh') or 1.4)
        run = p.add_run()
        run.text = line
        f = run.font
        f.size = Pt(max(1.0, round(float(it.get('size') or 13) * 0.75, 1)))
        f.bold = int(it.get('weight') or 400) >= 600
        f.name = it.get('font') or '微软雅黑'
        f.color.rgb = hexcolor(it.get('color') or '#333333')
    if it.get('rotate'):
        box.rotation = float(it['rotate'])
    no_shadow(box)
    return box


def apply_fill(shape, it):
    fill = it.get('fill')
    if it.get('fillGrad') and not fill:
        fill = it['fillGrad'].get('from') or '#EEEEEE'
    if not fill or fill == 'none':
        shape.fill.background()
        return
    shape.fill.solid()
    shape.fill.fore_color.rgb = hexcolor(fill)
    if it.get('opacity') is not None:
        set_alpha(shape, it['opacity'])
    if it.get('fillGrad') and it['fillGrad'].get('opacity') is not None:
        set_alpha(shape, it['fillGrad']['opacity'])


def apply_line(shape, it):
    if it.get('stroke') and it['stroke'] != 'none':
        shape.line.color.rgb = hexcolor(it['stroke'])
        shape.line.width = Pt(max(0.75, float(it.get('sw') or 1) * 0.75))
        ds = dash_style(it.get('dash'))
        if ds is not None:
            shape.line.dash_style = ds
    else:
        shape.line.fill.background()


def build(scene, out_path):
    prs = Presentation()
    scenes = scene.get('slides') if isinstance(scene.get('slides'), list) else [scene]
    first = scenes[0]
    prs.slide_width = Emu(int(first['w'] * PX))
    prs.slide_height = Emu(int(first['h'] * PX))
    for sc in scenes:
        slide = prs.slides.add_slide(prs.slide_layouts[6])
        paint_slide(slide, sc)
    prs.save(out_path)
    return out_path


def paint_slide(slide, scene):
    # 背景
    bg = scene.get('bg') or '#FFFFFF'
    bg_fill = slide.background.fill
    bg_fill.solid()
    bg_fill.fore_color.rgb = hexcolor(bg)

    for it in scene.get('items', []):
        t = it.get('type')
        if t == 'text':
            add_text(slide, it)
            continue
        if t == 'line':
            conn = slide.shapes.add_connector(1, Emu(int(it['x1'] * PX)), Emu(int(it['y1'] * PX)), Emu(int(it['x2'] * PX)), Emu(int(it['y2'] * PX)))
            conn.line.color.rgb = hexcolor(it.get('stroke') or '#000000')
            conn.line.width = Pt(max(0.75, float(it.get('sw') or 1) * 0.75))
            if it.get('dash'):
                conn.line.dash_style = MSO_LINE_DASH_STYLE.DASH
            if it.get('opacity') is not None:
                try:
                    solid = conn.line.color._xFill.find(qn('a:solidFill'))
                    if solid is not None:
                        alpha_el = etree.SubElement(solid[0], qn('a:alpha'))
                        alpha_el.set('val', str(int(it['opacity'] * 100000)))
                except Exception:
                    pass
            no_shadow(conn)
            continue
        if t == 'poly':
            pts = [(p[0], p[1]) for p in it['points']]
            if len(pts) < 2:
                continue
            fb = slide.shapes.build_freeform(pts[0][0], pts[0][1], scale=PX)
            fb.add_line_segments(pts[1:], close=not it.get('open'))
            shape = fb.convert_to_shape()
            if it.get('open'):
                shape.fill.background()
            else:
                apply_fill(shape, it)
            apply_line(shape, it)
            no_shadow(shape)
            if it.get('rotate'):
                shape.rotation = float(it['rotate'])
            continue
        if t in ('rect', 'ellipse'):
            preset = MSO_SHAPE.OVAL if t == 'ellipse' else (MSO_SHAPE.ROUNDED_RECTANGLE if (it.get('r') or 0) > 0 else MSO_SHAPE.RECTANGLE)
            shape = slide.shapes.add_shape(preset, Emu(int(it['x'] * PX)), Emu(int(it['y'] * PX)), Emu(int(it['w'] * PX)), Emu(int(it['h'] * PX)))
            if preset == MSO_SHAPE.ROUNDED_RECTANGLE:
                try:
                    shape.adjustments[0] = min(0.5, float(it['r']) / max(1.0, min(it['w'], it['h'])))
                except Exception:
                    pass
            apply_fill(shape, it)
            apply_line(shape, it)
            no_shadow(shape)
            if it.get('rotate'):
                shape.rotation = float(it['rotate'])
            continue
        # path 等不支持的类型跳过


if __name__ == '__main__':
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        data = json.load(f)
    build(data, sys.argv[2])
    print(json.dumps({'ok': True, 'out': sys.argv[2], 'items': len(data.get('items', []))}, ensure_ascii=False))
