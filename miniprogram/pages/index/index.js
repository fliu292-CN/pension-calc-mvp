import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    // 基础数据
    city: '北京',
    gender: 'male',
    age: 30,
    retireAge: 60, // 默认男性退休年龄
    years: 5,
    balance: 50000,
    salary: 20000,

    // 🌟 新增状态：是否开启涨薪预测
    useGrowth: false,

    // UI控制
    showCity: false,
    cityColumns: ['北京', '上海', '广州', '深圳'],
    result: null
  },

  // --- 事件处理 ---

  // 1. 性别变化时，自动联动退休年龄 (优化体验)
  onGenderChange(event) {
    const gender = event.detail;
    let newRetireAge = 60;

    if (gender === 'female') {
      newRetireAge = 55; // 女性默认55 (折中方案)
    }

    this.setData({
      gender: gender,
      retireAge: newRetireAge
    });
  },

  // 2. 基础输入绑定
  onAgeChange(event) { this.setData({ age: Number(event.detail) }); },
  onRetireAgeChange(event) { this.setData({ retireAge: Number(event.detail) }); },
  onYearsChange(event) { this.setData({ years: Number(event.detail) }); },
  onBalanceChange(event) { this.setData({ balance: Number(event.detail) }); },
  onSalaryChange(event) { this.setData({ salary: Number(event.detail) }); },

  // 3. 🌟 涨薪开关切换
  onGrowthChange({ detail }) {
    this.setData({ useGrowth: detail });
  },

  // 4. 城市选择器逻辑
  showCityPopup() { this.setData({ showCity: true }); },
  onCityCancel() { this.setData({ showCity: false }); },
  onCityConfirm(event) {
    const { value } = event.detail;
    this.setData({ city: value, showCity: false });
  },

  // --- 核心提交逻辑 ---
  onSubmit() {
    Toast.loading({
      message: '正在精算中...',
      forbidClick: true,
      duration: 0
    });

    // 构造请求包 (注意：这里不再传 gender，因为后端算法已经解耦)
    const payload = {
      city: this.data.city,
      age: this.data.age,
      retire_age: this.data.retireAge,
      years: this.data.years,
      balance: this.data.balance,
      salary: this.data.salary,
      // 🌟 传给后端的增长率：开启则3%，关闭则0
      wage_growth: this.data.useGrowth ? 0.03 : 0
    };

    // 调用云托管接口
    wx.cloud.callContainer({
      config: {
        env: 'prod-6gowvdzt4f684534' // 🔴 确保这里是你的环境ID
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
        console.log('计算成功', res);

        if (res.data && res.data.code === 0) {
          this.setData({ result: res.data.data });
          // 滚动页面到底部查看结果
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