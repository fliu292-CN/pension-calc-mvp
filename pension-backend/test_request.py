# test_request.py
import requests
import json

# 1. 设定目标地址 (注意端口要和你 main.py 里的一致，这里假设是 5000)
url = "https://pension-service-219415-6-1397084835.sh.run.tcloudbase.com/api/calculate"


def test_pension(growth_rate):
    payload = {
        "city": "北京",
        "age": 42,
        "retire_age": 50,
        "years": 13,
        "balance": 300000,
        "salary": 39000,
        "wage_growth": growth_rate  # 关键变量
    }

    try:
        print(f"📡 发送请求: 涨薪幅度 {growth_rate * 100}% ...")
        res = requests.post(url, json=payload, timeout=10)

        if res.status_code == 200:
            data = res.json()['data']
            money = data['detail']['total_pension']
            print(f"✅ 计算成功: ¥ {money}")
            return money
        else:
            print(f"❌ 请求失败: {res.status_code} - {res.text}")
            return None
    except Exception as e:
        print(f"❌ 连接错误: {e}")
        return None


if __name__ == "__main__":
    print(f"---- 开始对比测试 (目标: {url}) ----\n")

    # 第一次：保守模式 (0%)
    res_0 = test_pension(0)
    print("-" * 30)

    # 第二次：预测模式 (3%)
    res_3 = test_pension(0.03)
    print("\n" + "=" * 30)

    # 结果分析
    if res_0 and res_3:
        diff = res_3 - res_0
        if diff > 100:
            print(f"🎉 验证通过！")
            print(f"涨薪 3% 后，养老金增加了: ¥ {round(diff, 2)}")
            print("结论：后端代码已更新，逻辑生效中。")
        elif diff == 0:
            print(f"⚠️ 验证失败！结果完全一样。")
            print("结论：后端运行的 100% 是旧代码，云端部署未生效。")
        else:
            print(f"❓ 结果有微小差异 ({diff})，可能是计算精度问题。")
    else:
        print("测试中断，未能获取完整数据。")