import requests



headers = {
  "x-auth-endpoint": "1F1E",
  "x-auth-user": "ybousquet@onestock-retail.com",
  "x-auth-token": "470dda9b4ca78230c943daf0a03c3e63"
}


try:
  response = requests.get("https://soliver-clienteling.onestock-retail.io/api/emarsys/customer/informations/soliver/75c842ac-8d30-484f-b7b8-888593234c51", headers=headers)
  print(response.json())
except Exception as e:
  print(f"erreur:{e}")