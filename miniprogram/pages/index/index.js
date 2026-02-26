import Toast from '@vant/weapp/toast/toast';
import { calculatePension, REGION_CONFIG } from '../../utils/pension.js';

Page({
  data: {
    // ... 原有的数据不变 ...
    city: '北京',
    gender: 'female',
    age: 30,
    retireAge: 55,
    years: 5,
    balance: 50000,
    salary: 20000,
    useGrowth: false,
    isLyingFlat: false,
    flatInvestmentRate: '0.6',

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
  
  toggleMode(event) {
    const { mode } = event.currentTarget.dataset;
    const isLyingFlat = mode === 'flat';
    if (this.data.isLyingFlat === isLyingFlat) return;
    
    this.setData({ 
      isLyingFlat,
      // 切换模式时清空结果，避免数据混淆
      result: null 
    });
  },

  onFlatRateChange(event) { this.setData({ flatInvestmentRate: event.detail }); },
  onGenderChange(event) {
    const gender = event.detail;
    this.setData({ gender: gender, retireAge: gender === 'female' ? 55 : 60 });
  },
  onGrowthChange({ detail }) { this.setData({ useGrowth: detail }); },
  onShowYearsHelp() {
    wx.showModal({ title: '说明', content: '含视同缴费年限。缴费满15年是领取养老金的最低门槛。', showCancel: false });
  },

  // --- 提交函数 ---
  onSubmit() {
    if (this.data.age === '' || (!this.data.isLyingFlat && this.data.salary === '')) {
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
      wageGrowth: this.data.useGrowth ? 0.03 : 0,
      isLyingFlat: this.data.isLyingFlat,
      flatInvestmentRate: Number(this.data.flatInvestmentRate)
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
    const { params, factors, detail, isLyingFlat } = res;
    let texts = [];

    if (isLyingFlat) {
      texts.push(`【躺平计划】您选择现在停止工作，并以 ${params.flatInvestmentRate * 100}% 的档次自缴社保直到 ${params.retireAge} 岁。`);
      texts.push(`在此期间，您总计需要自行缴纳社保费用约 ${detail.total_cost} 元（已考虑 4050 等政策补贴）。`);
      
      if (detail.unemployment_benefit > 0) {
        texts.push(`基于您已缴纳 ${params.years} 年社保，躺平后您可以先领取约 ${detail.unemployment_months} 个月的失业金，总计约 ${detail.unemployment_benefit} 元，这可以作为您的起步资金。`);
      }

      if (detail.subsidy_4050 > 0) {
        texts.push(`由于您符合“4050”高龄就业困难群体条件，政府将为您补贴约 ${detail.subsidy_4050} 元的社保费用，大大降低了躺平门槛。`);
      }

      const roiMonths = detail.total_cost / detail.total_pension;
      texts.push(`退休后，您预计每月领取 ${detail.total_pension} 元。您的躺平回本周期约为 ${roiMonths.toFixed(1)} 个月（即退休后 ${(roiMonths / 12).toFixed(1)} 年回本）。`);
      
      if (params.flatInvestmentRate === 0.6) {
        texts.push(`提示：当前您选择的是 60% 最低档位，这是性价比最高的方案，回本最快。`);
      }
    } else {
      const p1 = `您今年 ${params.age} 岁，所在省份/城市目前的平均养老金计发基数为 ${factors.baseSalary} 元。`;
      const p2 = `您计划在 ${params.retireAge} 岁退休，距离现在还有 ${factors.yearsToWork} 年。退休时该地区的计发基数预计将达到约 ${factors.futureBaseSalary.toFixed(2)} 元。`;
      const p3 = `根据公式，您的【基础养老金】预估为：${detail.basic_pension} 元。这是基于您 ${factors.totalYears} 年的累计缴费计算得出的。`;
      const p4 = `到退休时，您的个人账户总额预计达到 ${detail.final_balance} 元。按 ${params.retireAge} 岁退休计发月数 ${factors.dividingMonths} 个月计算，【个人账户养老金】为 ${detail.account_pension} 元。`;
      texts = [p1, p2, p3, p4];
    }

    const summary = `【总结】退休后总月领金额预估为 ${detail.total_pension} 元。`;
    texts.push(summary);
    return texts;
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