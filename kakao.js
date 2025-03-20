function redirectIfKakaoBrowser() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("kakaotalk")) {
    alert("카카오톡 인앱 브라우저에서는 로그인이 불가능합니다. 외부 브라우저로 이동합니다.");
    window.location.href = "googlechrome://browse?url=" + encodeURIComponent(window.location.href);
  }
}

redirectIfKakaoBrowser();
