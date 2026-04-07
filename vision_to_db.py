import cv2
import time
from ultralytics import YOLO
from supabase import create_client, Client

# 1. Supabase 설정 (현성님 정보 유지)
url = "https://jhduyrvvnjxxrwexdquw.supabase.co"
key = "sb_publishable_u7mKlPgZXlMyt-ceoTuJPA_XIWg2khr"
supabase: Client = create_client(url, key)

model = YOLO("best (1).pt") 
cap = cv2.VideoCapture(0)

# --- 치밀한 상태 관리를 위한 튜닝 파라미터 ---
is_logged = False           
missing_counter = 0         
detection_counter = 0

# [조절 포인트] 시연 환경에 따라 아래 숫자를 조절하세요.
CONFIRM_THRESHOLD = 3       # 3번 연속 99% 확신이 들어야 "입고" 처리
MISSING_LIMIT = 30          # 30프레임(약 3~5초) 동안 안 보여야 "삭제" 처리
CONFIDENCE_LEVEL = 0.99     # 99% 확신할 때만 인식 (지갑/폰 무시용)

print(f"🍌 [지능형 감시 시스템] {CONFIDENCE_LEVEL*100}% 확신 모드 가동 중...")

while cap.isOpened():
    success, frame = cap.read()
    if not success: break

    # 99% 신뢰도로 지갑/침대 등 오인식 완벽 차단
    results = model(frame, conf=CONFIDENCE_LEVEL, verbose=False)
    detected_now = len(results[0].boxes) > 0

    if detected_now:
        # 바나나가 보이면 '사라짐 카운터' 리셋 및 '감지 카운터' 상승
        missing_counter = 0
        detection_counter += 1
        
        # 확실히 보일 때만(안정적일 때) DB 입고
        if detection_counter >= CONFIRM_THRESHOLD and not is_logged:
            # 현재 모델이 {0: 'banana'}만 알기 때문에 status는 '입고됨'으로 표기하는 게 덜 허술해 보입니다.
            data = {"label": "Banana", "percentage": 99, "status": "In Stock"}
            try:
                supabase.table("freshness_data").insert(data).execute()
                print("🚀 [입고 확정] 바나나 감지 및 클라우드 동기화 완료")
                is_logged = True
            except Exception as e:
                print(f"❌ 전송 실패: {e}")
    else:
        # 바나나가 안 보이기 시작하면 '감지 카운터' 리셋
        detection_counter = 0
        if is_logged:
            missing_counter += 1
            # 다른 과일을 꺼내느라 살짝 가려진 건 무시, 30프레임 이상 안 보일 때만 퇴고
            if missing_counter >= MISSING_LIMIT:
                try:
                    # 'Banana' 태그를 가진 데이터를 삭제하여 실시간 재고 반영
                    supabase.table("freshness_data").delete().eq("label", "Banana").execute()
                    print("🧹 [퇴고 확정] 바나나가 제거되어 재고에서 삭제되었습니다.")
                    is_logged = False
                    missing_counter = 0
                except Exception as e:
                    print(f"❌ 삭제 실패: {e}")

    # 모니터링 화면 표시
    annotated_frame = results[0].plot()
    # 화면에 현재 카운터 상태 표시 (디버깅용)
    cv2.putText(annotated_frame, f"Detect: {detection_counter} | Miss: {missing_counter}", 
                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    cv2.imshow("Robust Smart Storage", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"): break

cap.release()
cv2.destroyAllWindows()