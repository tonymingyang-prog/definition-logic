// 预览用示例内容：让每个元素在没人填槽位时也有东西可看
export function sampleContent(def) {
  const fixed = {
    'matrix.grid': {
      cols: ['交易域', '履约域', '客户域'],
      rows: ['现状', '目标'],
      cells: [['订单中心已上线', '分单规则硬编码', '客户视图分散'], ['统一订单模型', '规则引擎化', 'OneID 打通']],
    },
    'board.columns': {
      cols: [
        { title: '待评估', items: ['客服工单改版', '库存预警规则'] },
        { title: '进行中', items: ['订单中心迁移', '主数据治理'] },
        { title: '已上线', items: ['统一门户'] },
      ],
    },
    'dual.hub': { left: '数字化', right: '自动化', bridge: '数实融合' },
    'eco.bracket': { center: '业务中台', left: ['数据标准', '主数据', '指标口径', '安全合规'], right: ['运维保障', '监控告警', '灰度发布', '容量规划'] },
    'flow.lanes': {
      lanes: [
        { title: '接入层', items: ['门户', 'API', '移动端'] },
        { title: '服务层', items: ['用户', '订单', '商品'] },
        { title: '数据层', items: ['ODS', 'DWD', 'ADS'] },
      ],
    },
    'layers.band': {
      layers: [
        { title: '应用层', items: ['营销', '供应', '财务'] },
        { title: '中台层', items: ['数据中台', '业务中台'] },
        { title: '底座层', items: ['云原生', '数据湖'] },
      ],
    },
    'platform.disc': {
      layers: [
        { title: 'saas', items: ['营销云', '供应云', '财务云'] },
        { title: 'paas', items: ['数据中台', '业务中台'] },
        { title: 'iaas', items: ['弹性计算', '对象存储'] },
      ],
    },
    'arc.fan': { items: [{ title: '电商' }, { title: '零售' }, { title: '物流' }, { title: '金融' }, { title: '制造' }, { title: '政务' }, { title: '教育' }] },
    timeline: {
      items: [
        { date: '2025 Q1', title: '底座搭建', desc: '云资源与接入' },
        { date: '2025 Q2', title: '中台成型', desc: '用户/订单域' },
        { date: '2025 Q3', title: '业务迁移', desc: '两条线切流' },
        { date: '2025 Q4', title: '规模化', desc: '口径统一' },
      ],
    },
    'flow.steps': {
      items: [
        { title: '统一入口', desc: '一个门户' },
        { title: '流程贯通', desc: '端到端' },
        { title: '数据沉淀', desc: '指标可用' },
        { title: '持续运营', desc: '闭环迭代' },
      ],
    },
    'flow.chevron': { items: [{ title: '需求' }, { title: '设计' }, { title: '开发' }, { title: '验证' }, { title: '上线' }] },
    'hub.radial': {
      center: '数据中台',
      items: [{ title: '报表看板' }, { title: '标签画像' }, { title: '指标服务' }, { title: '自助分析' }, { title: '数据资产' }, { title: '实时计算' }],
    },
    medallion: {
      center: '业务中台',
      items: [{ title: '客户' }, { title: '订单' }, { title: '商品' }, { title: '库存' }, { title: '结算' }, { title: '营销' }, { title: '履约' }, { title: '售后' }],
    },
    'stack.list': {
      items: [
        { title: '统一门户', desc: '一个入口' },
        { title: '流程中心', desc: '审批闭环' },
        { title: '数据底座', desc: '口径统一' },
        { title: '运营看板', desc: '过程可见' },
      ],
    },
    'pyramid.levels': { items: [{ title: '战略层' }, { title: '业务层' }, { title: '能力层' }, { title: '底座层' }] },
  };
  if (fixed[def.id]) return fixed[def.id];
  const c = {};
  for (const sl of def.slots || []) {
    if (sl.id === 'items') {
      c.items = [
        { title: '营销域', desc: '人群与活动' },
        { title: '供应域', desc: '采购与库存' },
        { title: '财务域', desc: '核算与结算' },
        { title: '人力域', desc: '组织与绩效' },
      ];
    } else if (sl.id === 'left' || sl.id === 'right') {
      c[sl.id] = ['数据标准', '主数据', '指标口径', '安全合规'];
    } else {
      c[sl.id] = sl.example;
    }
  }
  return c;
}
