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
    this.setData({ city: value, showCity: false }, () => {
      this.calculateMonthlyFlatCost();
    });
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
    }, () => {
      if (isLyingFlat) this.calculateMonthlyFlatCost();
    });
  },

  onFlatRateClick(event) { 
    const rate = event.currentTarget.dataset.rate;
    if (this.data.flatInvestmentRate !== rate) {
      this.setData({ flatInvestmentRate: rate }, () => {
        this.calculateMonthlyFlatCost();
      }); 
    }
  },

  calculateMonthlyFlatCost() {
    if (!this.data.isLyingFlat) return;
    const config = REGION_CONFIG[this.data.city];
    if (config) {
      const monthlyCost = Math.round(config.baseSalary * Number(this.data.flatInvestmentRate) * 0.20);
      this.setData({ monthlyFlatCost: monthlyCost });
    }
  },
  onGenderChange(event) {
    const gender = event.detail;
    this.setData({ gender: gender, retireAge: gender === 'female' ? 55 : 60 });
  },
  onGrowthChange({ detail }) { this.setData({ useGrowth: detail }); },

  // --- 2025 延迟退休新规计算逻辑 ---
  getReformDetails() {
    const { age, retireAge, gender } = this.data;
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - Number(age);
    const retireYear = currentYear + (Number(retireAge) - Number(age));

    // 1. 最低缴费年限计算
    let minYears = 15;
    if (retireYear >= 2030) {
      minYears = 15 + Math.min(5, (retireYear - 2029) * 0.5);
    }

    // 2. 建议退休年龄 (基于新规简单估算)
    // 男 60->63 (4个月延1个月), 女(管) 55->58 (4个月延1个月), 女(工) 50->55 (2个月延1个月)
    let reformRetireAge = Number(gender === 'male' ? 60 : (this.data.isWorker ? 50 : 55));
    // 这里简化处理，实际需要出生年月。我们假设用户按原计划退休，看看新规下他理论上应该延多久
    // 仅作展示提示
    
    return { minYears, retireYear };
  },

  onShowYearsHelp() {
    const { minYears, retireYear } = this.getReformDetails();
    let detailMsg = `目前领取养老金的最低缴费年限要求为 ${minYears} 年。`;
    
    if (retireYear >= 2030) {
      detailMsg = `根据 2025 年延迟退休新规，由于您预计在 ${retireYear} 年退休，您的最低缴费年限要求已提高至 ${minYears} 年（从 2030 年起每年提高 6 个月）。`;
    }

    wx.showModal({ 
      title: '缴费年限说明', 
      content: `${detailMsg}\n\n注：含视同缴费年限。累计缴费年限不足 ${minYears} 年的，退休时无法按月领取养老金。`, 
      showCancel: false 
    });
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
    const { minYears, retireYear } = this.getReformDetails();
    let texts = [];

    // 🌟 检查缴费年限是否达标
    if (factors.totalYears < minYears) {
      texts.push(`⚠️ 注意：在新规下，您在 ${retireYear} 年退休时的累计缴费年限为 ${factors.totalYears} 年，而该年份的最低要求为 ${minYears} 年。您可能需要延长缴费或无法按月领取养老金。`);
    }

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
      title: '提前躺平计算器：老板对不起，我算完这笔账想先撤了... 🏖️',
      path: '/pages/index/index'
    };
  },

  /**
   * 🌟 用户分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '提前躺平计算器：老板对不起，我算完这笔账想先撤了... 🏖️',
      query: ''
    };
  }
});