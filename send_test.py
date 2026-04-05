# -*- coding: utf-8 -*-
import sys
from supabase import create_client, Client

# 1. 주소와 키를 ' ' 따옴표 안에 빈칸 없이 넣으세요!
# 복사할 때 한글이 섞이지 않게 주의!
url = "https://jhduyrvvnjxxrwexdquw.supabase.co".strip()
key = "sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr".strip()

def test_push():
    print("🚀 [1단계] 데이터 전송 시도 시작...")
    try:
        supabase: Client = create_client(url, key)
        
        # 보낼 데이터 (ID 7번으로 99% 쏴봅니다)
        data = {"percentage": 95, "status": "Fresh", "label": "Apple"}
        
        print("📡 [2단계] DB에 신호 보내는 중...")
        response = supabase.table("freshness_data").insert(data).execute()
        
        # 결과 출력 (이게 빈 괄호[]면 전송 실패인 겁니다)
        print(f"📊 [3단계] DB 응답 결과: {response.data}")
    
        if len(response.data) > 0:
            print("✅ [최종] 전송 성공! 이제 Supabase 사이트 새로고침해보세요.")
        else:
            print("❌ [경고] 응답은 왔지만 데이터가 안 들어갔습니다. 테이블 이름을 확인하세요.")

    except Exception as e:
        print(f"❌ [에러 발생]: {e}")

# 🔥 이 아래 부분이 있어야 파일이 실행됩니다! 지우지 마세요!
if __name__ == "__main__":
    test_push()