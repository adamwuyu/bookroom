运行以下命令，会出现“工具参数格式错误！”，请分析这个问题的细节。
```bash
# 使用Agent进行问答
curl -X POST "http://localhost:5001/api/v1/agent/9f5389cc-affb-4715-befd-0a893a94feb3/chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjRkNmQ2OS04YjJkLTQ5MzUtODAwYS02ZGE1N2Q1OGRlNjIiLCJ0eXBlIjoiYWNjZXNzX3Rva2VuIiwiaWF0IjoxNzQzNzY3NzkwLCJleHAiOjE3NDM4NTQxOTB9.KXqG80B-CClKiJ76G1GkIcC3sG2VDNI9Jwyaw3Dj-1Q" \
  -d '{
    "query": {"question": "搜索最新上映的电影"}, 
    "is_stream": true
  }'
```