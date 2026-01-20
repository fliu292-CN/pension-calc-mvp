import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    city: '北京',
    gender: 'male',
    // 初始值给数字，但允许输入时变为空字符串
    age: 30,
    retireAge: 60,
    years: 5,
    balance: 50000,
    salary: 20000,
    useGrowth: false,

    showCity: false,
    cityColumns: ['北京', '上海', '广州', '深圳'],
    result: null
  },

  // --- 输入事件 (修复 NaN 问题：直接存字符串，不强转数字) ---
  onAgeChange(event) { this.setData({ age: event.detail }); },
  onRetireAgeChange(event) { this.setData({ retireAge: event.detail }); },
  onYearsChange(event) { this.setData({ years: event.detail }); },
  onBalanceChange(event) { this.setData({ balance: event.detail }); },
  onSalaryChange(event) { this.setData({ salary: event.detail }); },

  // --- 交互逻辑 ---
  onGenderChange(event) {
    const gender = event.detail;
    this.setData({
      gender: gender,
      retireAge: gender === 'female' ? 55 : 60
    });
  },

  onGrowthChange({ detail }) {
    this.setData({ useGrowth: detail });
  },

  // 帮助弹窗
  onShowYearsHelp() {
    wx.showModal({
      title: '已缴年限说明',
      content: '指您实际已经缴纳社保的累计年数（含视同缴费年限）。如果不确定，可以查询“个人所得税”App或当地社保局。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#07c160'
    });
  },

  // 城市选择器
  showCityPopup() { this.setData({ showCity: true }); },
  onCityCancel() { this.setData({ showCity: false }); },
  onCityConfirm(event) {
    const { value } = event.detail;
    this.setData({ city: value, showCity: false });
  },

  // --- 提交计算 ---
  onSubmit() {
    // 校验：如果为空则提示
    if (this.data.age === '' || this.data.salary === '') {
      Toast.fail('请填写完整信息');
      return;
    }

    Toast.loading({
      message: '正在精算...',
      forbidClick: true,
      duration: 0
    });

    // 🌟 构造数据包 (在这里统一转成数字)
    const payload = {
      city: this.data.city,
      gender: this.data.gender,
      age: Number(this.data.age),
      retire_age: Number(this.data.retireAge),
      years: Number(this.data.years),
      balance: Number(this.data.balance),
      salary: Number(this.data.salary),
      wage_growth: this.data.useGrowth ? 0.03 : 0
    };

    wx.cloud.callContainer({
      config: {
        env: 'prod-6gowvdzt4f684534' // 你的环境ID
      },
      path: '/api/calculate',
      header: {
        'X-WX-SERVICE': 'pension-service',
        'content-type': 'application/json'
      },
      method: 'POST',
      data: payload,
      success: (res) => {
        Toast.clear();
        if (res.data && res.data.code === 0) {
          this.setData({ result: res.data.data });
          // 滚动到底部
          wx.pageScrollTo({ scrollTop: 1000, duration: 300 });
        } else {
          Toast.fail(res.data.error || '计算出错');
        }
      },
      fail: (err) => {
        Toast.clear();
        console.error(err);
        Toast.fail('网络请求失败');
      }
    });
  }
});