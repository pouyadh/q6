; This will work with electron-builder's default installation detection
!macro customInstall
  ; Check if already installed using APP_ID
  ReadRegStr $0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "DisplayName"
  ${If} $0 != ""
    MessageBox MB_YESNO|MB_ICONQUESTION \
      "${PRODUCT_NAME} is already installed.$\n$\nDo you want to uninstall the existing version?" \
      IDYES UninstallExisting IDNO SkipUninstall
    
    UninstallExisting:
      ReadRegStr $1 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}" "UninstallString"
      ${If} $1 != ""
        ExecWait '"$1" /S _?=$INSTDIR'
        Sleep 2000
        RMDir /r "$INSTDIR"
      ${EndIf}
      DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_ID}"
  ${EndIf}
  
  SkipUninstall:
  ; Add to startup
  CreateShortCut "$SMSTARTUP\${PRODUCT_NAME}.lnk" "$INSTDIR\${PRODUCT_FILENAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}" '"$INSTDIR\${PRODUCT_FILENAME}"'
!macroend

!macro customUnInstall
  Delete "$SMSTARTUP\${PRODUCT_NAME}.lnk"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "${PRODUCT_NAME}"
!macroend