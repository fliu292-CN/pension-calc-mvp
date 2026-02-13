import Toast from '@vant/weapp/toast/toast';
import { calculatePension, REGION_CONFIG } from '../../utils/pension.js';

Page({
  data: {
    // ... 原有的数据不变 ...
    city: '北京',
    gender: 'female',
    age: 30,
    retireAge: 50,
    years: 5,
    balance: 50000,
    salary: 20000,
    useGrowth: false,

    showCity: false,
    cityColumns: [
      '北京', '上海', '天津', '重庆',
      '深圳', '大连', '宁波', '厦门', '青岛',
      '广东', '江苏', '浙江', '山东', '四川', '湖北', '福建', '湖南', '安徽', '河南', '河北', '辽宁', '陕西', '江西', '广西', '贵州', '云南', '内蒙古', '山西', '吉林', '黑龙江', '甘肃', '宁夏', '青海', '新疆', '海南'
    ],
    defaultCityIndex: 0, 

    result: null
  },

  // ... 
  showCityPopup() {
    const currentIndex = this.data.cityColumns.indexOf(this.data.city);
    this.setData({ 
      showCity: true,
      defaultCityIndex: currentIndex >= 0 ? currentIndex : 0
    });
  },
  onCityCancel() { this.setData({ showCity: false }); },
  onCityConfirm(event) {
    const { value } = event.detail;
    this.setData({ city: value, showCity: false });
  },

  onAgeChange(event) { this.setData({ age: event.detail }); },
  onRetireAgeChange(event) { this.setData({ retireAge: event.detail }); },
  onYearsChange(event) { this.setData({ years: event.detail }); },
  onBalanceChange(event) { this.setData({ balance: event.detail }); },
  onSalaryChange(event) { this.setData({ salary: event.detail }); },
  onGenderChange(event) {
    const gender = event.detail;
    this.setData({ gender: gender, retireAge: gender === 'female' ? 55 : 60 });
  },
  onGrowthChange({ detail }) { this.setData({ useGrowth: detail }); },
  onShowYearsHelp() {
    wx.showModal({ title: '说明', content: '含视同缴费年限...', showCancel: false });
  },

  // --- 提交函数 ---
  onSubmit() {
    if (this.data.age === '' || this.data.salary === '') {
      Toast.fail('请填写完整信息');
      return;
    }
    Toast.loading({ message: '正在估算...', forbidClick: true, duration: 500 });

    const payload = {
      city: this.data.city,
      gender: this.data.gender,
      age: Number(this.data.age),
      retireAge: Number(this.data.retireAge),
      years: Number(this.data.years),
      balance: Number(this.data.balance),
      salary: Number(this.data.salary),
      wageGrowth: this.data.useGrowth ? 0.03 : 0
    };

    const res = calculatePension(payload);

    if (res.code === 0) {
      const data = res.data;
      const processText = this.generateProcessText(data);

      this.setData({
        result: data,
        processText: processText
      });

      // 🌟 精准滚动：让结果卡片顶部对齐屏幕
      wx.nextTick(() => {
        wx.createSelectorQuery()
          .select('#result-section')
          .boundingClientRect(rect => {
            if (rect) {
              wx.pageScrollTo({
                scrollTop: rect.top - 20, // 预留 20px 边距，不顶死
                duration: 300
              });
            }
          })
          .exec();
      });
    } else {
      Toast.fail(res.error || '计算出错');
    }
  },

  generateProcessText(res) {
    const { params, factors, detail } = res;
    const p1 = `您今年 ${params.age} 岁，所在省份/城市目前的平均养老金计发基数（可理解为平均工资）为 ${factors.baseSalary} 元。`;
    const p2 = `您计划在 ${params.retireAge} 岁退休，距离现在还有 ${factors.yearsToWork} 年。按基数每年增长 ${(params.baseGrowth * 100).toFixed(0)}% 预测，您退休时该地区的计发基数将达到约 ${factors.futureBaseSalary.toFixed(2)} 元。`;
    const p3 = `您当前的月薪为 ${params.salary} 元，据此估算出您的平均缴费指数为 ${factors.avgIndex.toFixed(2)}。到退休时，您的累计缴费年限将达到 ${factors.totalYears} 年。根据公式，您的【基础养老金】预估为：${factors.futureBaseSalary.toFixed(2)} × (1 + ${factors.avgIndex.toFixed(2)}) ÷ 2 × ${factors.totalYears} × 1% = ${detail.basic_pension} 元。`;
    const p4 = `您现在的个人账户余额为 ${params.balance} 元。在未来的 ${factors.yearsToWork} 年里，按现有缴费水平，您的账户还将累计存入约 ${factors.futureContribution.toFixed(2)} 元。`;
    const p5 = `到退休时，您的个人账户总额预计达到 ${detail.final_balance} 元。根据国家标准，${params.retireAge} 岁退休对应的计发月数为 ${factors.dividingMonths} 个月。因此，您的【个人账户养老金】预估为：${detail.final_balance} ÷ ${factors.dividingMonths} = ${detail.account_pension} 元。`;
    const summary = `【总结】基础养老金 (${detail.basic_pension}) + 个人账户养老金 (${detail.account_pension}) = 总月领金额 ${detail.total_pension} 元。`;
    return [p1, p2, p3, p4, p5, summary];
  },

  /**
   * 🌟 用户点击右上角分享给朋友
   */
  onShareAppMessage() {
    return {
      title: '我的退休金能领多少？试试养老金估算工具',
      path: '/pages/index/index'
    };
  },

  /**
   * 🌟 用户分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '我的退休金能领多少？试试养老金估算工具',
      query: ''
    };
  }
});