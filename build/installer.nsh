; YumYum 주문 접수 시스템 NSIS 인스톨러 설정
; 이 파일은 Windows 인스톨러 커스터마이징을 위한 NSIS 스크립트입니다

!macro customInstall
  ; 커스텀 설치 작업이 필요한 경우 여기에 추가
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayName" "YumYum 주문 접수 시스템"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "Publisher" "YumYum Co."
!macroend

!macro customUnInstall
  ; 커스텀 제거 작업이 필요한 경우 여기에 추가
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
!macroend
