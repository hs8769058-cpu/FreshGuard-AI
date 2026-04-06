import cv2
import time
from ultralytics import YOLO
from supabase import create_client, Client

# Supabase 설정 (본인 것으로 유지)
url = "현성님의_URL"
key = "현성님의_KEY"
supabase: Client = create_client(url, key)

model = YOLO("best (1).pt") 
cap = cv2.VideoCapture(0)

last_send_time = 0
send_interval = 5  # 5초에 한 번만 전송 (화면 도배 방지)
frame_count = 0

print("🍌 시연용 바나나 시스템 가동 (저사양 모드)")

while cap.isOpened():
    success, frame = cap.read()
    if not success: break

    frame_count += 1
    # 10프레임마다 한 번만 AI 분석 (노트북 팬 소리 줄이기 핵심!)
    if frame_count % 10 == 0:
        results = model(frame, conf=0.5, verbose=False) # 로그도 안 뜨게 조용히

        for r in results:
            if len(r.boxes) > 0:
                current_time = time.time()
                if current_time - last_send_time > send_interval:
                    # 감지된 객체 정보 가져오기
                    label = "Banana" 
                    percentage = 92 # 신선도 (시연용으로 높게 설정)
                    
                    data = {"label": label, "percentage": percentage, "status": "Fresh"}
                    
                    try:
                        supabase.table("freshness_data").insert(data).execute()
                        print(f"🚀 [입고 알림] {label}가 시스템에 등록되었습니다!")
                        last_send_time = current_time
                    except Exception as e:
                        print(f"❌ 전송 실패: {e}")

        # 분석 결과 화면에 표시
        annotated_frame = results[0].plot()
        cv2.imshow("AI Monitor", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"): break

cap.release()
cv2.destroyAllWindows()