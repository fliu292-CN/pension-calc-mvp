# test_request.py
import requests
import json

# 1. 设定目标地址 (注意端口要和你 main.py 里的一致，这里假设是 5000)
url = "https://pension-service-219415-6-1397084835.sh.run.tcloudbase.com/api/calculate"

# 2. 准备模拟数据 (模拟一个用户输入)
payload = {
    "city": "北京",
    "age": 30,
    "retire_age": 60,
    "gender": "male",
    "balance": 50000,
    "years": 5,
    "salary": 20000
}

# 3. 发送 POST 请求
print(f"正在向 {url} 发送请求...")
try:
    response = requests.post(url, json=payload)

    # 4. 打印结果
    if response.status_code == 200:
        print("\n✅ 测试成功！服务端返回数据如下：")
        print("-" * 30)
        # 美化打印 JSON
        print(json.dumps(response.json(), indent=4, ensure_ascii=False))
        print("-" * 30)
    else:
        print(f"\n❌ 测试失败，状态码: {response.status_code}")
        print("错误信息:", response.text)

except Exception as e:
    print(f"\n❌ 无法连接到服务，请检查 main.py 是否正在运行。\n错误详情: {e}")