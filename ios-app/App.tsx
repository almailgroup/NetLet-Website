import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from "expo-glass-effect";
import { StatusBar } from "expo-status-bar";
import { type ComponentProps, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, PanResponder, Platform, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { WebView } from "react-native-webview";
import { MOBILE_NAVIGATION_LABELS, MOBILE_STOREFRONT_URL, STOREFRONT_HAPTIC_ACTIONS } from "./src/webStorefront";

type StorefrontAction = typeof STOREFRONT_HAPTIC_ACTIONS[number];
type MobileNavigationLabel = typeof MOBILE_NAVIGATION_LABELS[number];
type NativeShareMessage = { type: "share"; title: string; text: string; url: string };

const NAVIGATION_ICONS: Record<MobileNavigationLabel, ComponentProps<typeof Feather>["name"]> = {
  Home: "home",
  Browse: "menu",
  Saved: "heart",
  Account: "user",
  Cart: "shopping-bag",
};

const STOREFRONT_HAPTIC_BRIDGE = `
  (function () {
    var nativeNavigationStyle = document.createElement("style");
    nativeNavigationStyle.textContent = '@media (max-width: 1023px) { nav[aria-label="Mobile navigation"] { display: none !important; } }';
    (document.head || document.documentElement).appendChild(nativeNavigationStyle);
    var navLabels = new Set(${JSON.stringify(MOBILE_NAVIGATION_LABELS)});
    var send = function (payload) {
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    };
    var normalise = function (value) { return (value || "").replace(/\\s+/g, " ").trim(); };
    var actionForButton = function (button) {
      var navParent = button.closest && button.closest('nav[aria-label="Mobile navigation"]');
      var label = normalise(button.textContent);
      var aria = normalise(button.getAttribute("aria-label"));
      if (navParent && navLabels.has(label)) return "navigation";
      if (/^Save /.test(aria)) return "selection";
      if (/^(Add .+ to bag|Add to bag)$/.test(aria) || /^Add to bag$/i.test(label)) return "medium";
      if (/^Continue to checkout$/i.test(label)) return "medium";
      if (/^(Close |Remove |View )/.test(aria)) return "selection";
      return null;
    };
    var closeBrowseSidebar = function () {
      var closeButton = document.querySelector('button[aria-label="Close menu"]');
      if (closeButton) closeButton.click();
    };
    window.__netletInvokeMobileNavigation = function (label) {
      if (label === "Home") {
        closeBrowseSidebar();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (label === "Browse" && document.querySelector(".netlet-menu-scrim")) {
        closeBrowseSidebar();
        return;
      }
      if (label !== "Browse") closeBrowseSidebar();
      var attempts = 0;
      var invoke = function () {
        var buttons = Array.prototype.slice.call(document.querySelectorAll('nav[aria-label="Mobile navigation"] button'));
        var target = buttons.find(function (button) { return normalise(button.textContent) === label; });
        if (!target && attempts++ < 32) { setTimeout(invoke, 60); return; }
        if (!target) return;
        window.__netletNativeNavigation = true;
        target.click();
        setTimeout(function () { window.__netletNativeNavigation = false; }, 0);
      };
      invoke();
    };
    var pendingNavigation = sessionStorage.getItem("netlet-native-mobile-navigation");
    if (pendingNavigation) {
      sessionStorage.removeItem("netlet-native-mobile-navigation");
      window.__netletInvokeMobileNavigation(pendingNavigation);
    }
    var pendingAuth = sessionStorage.getItem("netlet-native-auth-action");
    if (pendingAuth) {
      sessionStorage.removeItem("netlet-native-auth-action");
      var clickAuth = function () {
        var target = document.getElementById(pendingAuth === "signup" ? "netlet-auth-signup" : "netlet-auth-login");
        if (!target) { setTimeout(clickAuth, 80); return; }
        target.click();
      };
      setTimeout(clickAuth, 80);
    }
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest ? target.closest("button") : null;
      if (!button || window.innerWidth >= 1024) return;
      var action = actionForButton(button);
      var isNativeForwardedNavigation = action === "navigation" && window.__netletNativeNavigation === true;
      if (action && !isNativeForwardedNavigation) send({ type: "storefront-haptic", action: action });
    }, true);
    var sendScroll = function () { send({ type: "storefront-scroll", y: window.scrollY || document.documentElement.scrollTop || 0 }); };
    var sendPageContext = function () {
      var path = window.location.pathname || "/";
      var bagDrawerOpen = !!document.querySelector('[role="dialog"][aria-label="Your NetLet bag"]');
      send({ type: "storefront-page-context", path: path, modal: bagDrawerOpen });
    };
    window.addEventListener("scroll", sendScroll, { passive: true });
    window.addEventListener("load", sendScroll);
    var lastCount = null;
    var readBagCount = function () {
      var badge = document.querySelector('nav[aria-label="Mobile navigation"] button:last-child span');
      var count = badge ? parseInt(normalise(badge.textContent), 10) : 0;
      return Number.isFinite(count) ? count : 0;
    };
    var observeBag = function () {
      var count = readBagCount();
      send({ type: "storefront-bag-count", count: count });
      if (lastCount !== null && count > lastCount) send({ type: "storefront-haptic", action: "success" });
      lastCount = count;
      sendPageContext();
    };
    observeBag();
    new MutationObserver(observeBag).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  })();
  true;
`;

function NativeGlassNavigation({ cartCount, onNavigate }: { cartCount: number; onNavigate: (label: MobileNavigationLabel) => void }) {
  const insets = useSafeAreaInsets();
  const nativeGlassAvailable = Platform.OS === "ios" && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

  return <View pointerEvents="box-none" style={[styles.nativeNavigationPosition, { bottom: Math.max(insets.bottom - 8, 8) }]}>
    <GlassView
      glassEffectStyle={{ style: "regular", animate: true, animationDuration: 0.24 }}
      tintColor="#FFFDF9"
      colorScheme="light"
      isInteractive
      style={[styles.nativeNavigationGlass, !nativeGlassAvailable && styles.nativeNavigationFallback]}
    >
      {MOBILE_NAVIGATION_LABELS.map((label) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} onPress={() => onNavigate(label)} style={({ pressed }) => [styles.nativeNavigationItem, pressed && styles.nativeNavigationItemPressed]}>
        <View>
          <Feather name={NAVIGATION_ICONS[label]} size={25} color={label === "Home" ? "#0A285A" : "#536B8C"} strokeWidth={label === "Home" ? 2.7 : 2.25} />
          {label === "Cart" && cartCount > 0 ? <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View> : null}
        </View>
        <Text style={[styles.nativeNavigationLabel, label === "Home" && styles.nativeNavigationLabelActive]}>{label}</Text>
      </Pressable>)}
    </GlassView>
  </View>;
}

function NativeAccount({ onDismiss, onAuthenticate }: { onDismiss: () => void; onAuthenticate: (mode: "login" | "signup") => void }) {
  const insets = useSafeAreaInsets();
  return <View style={[styles.nativeAccount, { paddingTop: Math.max(insets.top, 18), paddingBottom: Math.max(insets.bottom, 18) }]}><View style={styles.nativeAccountHeader}><Pressable accessibilityRole="button" accessibilityLabel="Return to NetLet home" onPress={onDismiss} style={({ pressed }) => [styles.nativeAccountBack, pressed && styles.nativeNavigationItemPressed]}><Text style={styles.nativeAccountBackText}>‹</Text></Pressable><Text style={styles.nativeAccountWordmark}>NetLet</Text><View style={styles.nativeAccountHeaderBalance} /></View><View style={styles.nativeAccountBody}><View style={styles.nativeAccountMonogram}><Text style={styles.nativeAccountMonogramText}>N</Text></View><Text style={styles.nativeAccountEyebrow}>NETLET ACCOUNT</Text><Text style={styles.nativeAccountTitle}>Your account,{"\n"}your way.</Text><Text style={styles.nativeAccountCopy}>Sign in to keep saved finds and eligible delivery preferences together. Your shopping bag remains available without payment processing.</Text><Pressable accessibilityRole="button" onPress={() => onAuthenticate("login")} style={({ pressed }) => [styles.nativeAccountPrimary, pressed && styles.nativeNavigationItemPressed]}><Text style={styles.nativeAccountPrimaryText}>Sign in</Text></Pressable><Pressable accessibilityRole="button" onPress={() => onAuthenticate("signup")} style={({ pressed }) => [styles.nativeAccountSecondary, pressed && styles.nativeNavigationItemPressed]}><Text style={styles.nativeAccountSecondaryText}>Create account</Text></Pressable><Text style={styles.nativeAccountFootnote}>Secure account access continues through NetLet’s existing sign-in service.</Text></View></View>;
}

function NetLetApp() {
  const webView = useRef<WebView>(null);
  const webViewCapture = useRef<View>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [cartCount, setBagCount] = useState(0);
  const [nativeNavigationVisible, setNativeNavigationVisible] = useState(true);
  const [nativeAccountVisible, setNativeAccountVisible] = useState(false);
  const [refreshSnapshot, setRefreshSnapshot] = useState<string | null>(null);
  const atTop = useRef(true);
  const pullStage = useRef(0);
  const reloadPending = useRef(false);

  const playHaptic = (action: StorefrontAction) => {
    if (Platform.OS === "web") return;
    if (action === "selection") void Haptics.selectionAsync();
    if (action === "navigation" || action === "medium") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (action === "success") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const triggerRefresh = async () => {
    if (reloadPending.current) return;
    reloadPending.current = true;
    try {
      if (webViewCapture.current) {
        const snapshot = await captureRef(webViewCapture, { format: "png", quality: 0.92, result: "tmpfile" });
        setRefreshSnapshot(snapshot);
      }
    } catch {
      setRefreshSnapshot(null);
    }
    setLoading(true);
    if (Platform.OS !== "web") void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    webView.current?.reload();
  };

  const navigateStorefront = (label: MobileNavigationLabel) => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (label === "Account") {
      setNativeNavigationVisible(false);
      setNativeAccountVisible(true);
      return;
    }
    const escapedLabel = JSON.stringify(label);
    webView.current?.injectJavaScript(`(function () {
      var label = ${escapedLabel};
      if (window.location.pathname !== "/") {
        sessionStorage.setItem("netlet-native-mobile-navigation", label);
        window.location.assign("/");
        return;
      }
      if (typeof window.__netletInvokeMobileNavigation === "function") {
        window.__netletInvokeMobileNavigation(label);
      }
    })(); true;`);
  };

  const dismissNativeAccount = () => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNativeAccountVisible(false);
    setNativeNavigationVisible(true);
    webView.current?.injectJavaScript("window.location.assign('/'); true;");
  };

  const startNativeAuthentication = (mode: "login" | "signup") => {
    if (Platform.OS !== "web") void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNativeAccountVisible(false);
    setNativeNavigationVisible(false);
    webView.current?.injectJavaScript(`(function () { sessionStorage.setItem('netlet-native-auth-action', '${mode}'); window.location.assign('/account'); })(); true;`);
  };

  const pullResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => atTop.current && !reloadPending.current && gesture.dy > 10 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderMove: (_, gesture) => {
      if (!atTop.current || reloadPending.current) return;
      const nextStage = gesture.dy >= 94 ? 3 : gesture.dy >= 60 ? 2 : gesture.dy >= 28 ? 1 : 0;
      if (nextStage > pullStage.current) {
        pullStage.current = nextStage;
        if (Platform.OS !== "web") void Haptics.impactAsync(nextStage === 3 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
      }
    },
    onPanResponderRelease: (_, gesture) => {
      const shouldRefresh = atTop.current && pullStage.current >= 3 && gesture.dy >= 94;
      pullStage.current = 0;
      if (shouldRefresh) triggerRefresh();
    },
    onPanResponderTerminate: () => { pullStage.current = 0; },
  }), []);

  const handleWebMessage = (rawMessage: string) => {
    try {
      const message = JSON.parse(rawMessage) as { type?: string; action?: StorefrontAction; y?: number; count?: number; path?: string; modal?: boolean; title?: string; text?: string; url?: string } | NativeShareMessage;
      if (message.type === "storefront-scroll") atTop.current = (message.y ?? 0) <= 2;
      if (message.type === "storefront-bag-count") setBagCount(message.count ?? 0);
      if (message.type === "storefront-page-context") {
        if (message.path === "/account") {
          setNativeNavigationVisible(false);
          setNativeAccountVisible(true);
        } else {
          setNativeNavigationVisible(message.path === "/" && !message.modal);
        }
      }
      if (message.type === "storefront-haptic" && message.action && STOREFRONT_HAPTIC_ACTIONS.includes(message.action)) playHaptic(message.action);
      if (message.type === "share") void Share.share({ title: message.title, message: `${message.text}\n${message.url}`, url: message.url });
    } catch {
      // Ignore unrelated messages emitted by the embedded storefront.
    }
  };

  const handleLoadEnd = () => {
    setLoading(false);
    reloadPending.current = false;
    setRefreshSnapshot(null);
  };

  if (nativeAccountVisible) return <View style={styles.outer}><StatusBar style="dark" backgroundColor="#F3F2ED" /><NativeAccount onDismiss={dismissNativeAccount} onAuthenticate={startNativeAuthentication} /></View>;

  return <View style={styles.outer}><StatusBar style="dark" backgroundColor="#F3F2ED" /><SafeAreaView style={styles.safe} edges={["top", "left", "right"]}><View style={styles.page}>{failed ? <View style={styles.failure}><Text style={styles.failureTitle}>NetLet needs a connection.</Text><Text style={styles.failureCopy}>Reconnect to the internet, then reload the live marketplace.</Text><Text onPress={() => { setFailed(false); webView.current?.reload(); }} style={styles.retry}>Reload NetLet</Text></View> : <><View ref={webViewCapture} style={styles.webViewWrap} {...pullResponder.panHandlers}><WebView ref={webView} source={{ uri: MOBILE_STOREFRONT_URL }} style={styles.webView} originWhitelist={["https://*"]} startInLoadingState={false} onLoadStart={() => { if (!reloadPending.current) setLoading(true); }} onLoadEnd={handleLoadEnd} onError={() => { setLoading(false); setFailed(true); }} onHttpError={() => { setLoading(false); setFailed(true); }} onMessage={(event) => handleWebMessage(event.nativeEvent.data)} onNavigationStateChange={(state) => { const path = state.url.replace(/^https?:\/\/[^/]+/, "").split("?")[0]; setNativeNavigationVisible(path === "" || path === "/"); }} injectedJavaScriptBeforeContentLoaded={STOREFRONT_HAPTIC_BRIDGE} sharedCookiesEnabled thirdPartyCookiesEnabled javaScriptEnabled domStorageEnabled bounces decelerationRate="normal" automaticallyAdjustContentInsets={false} contentInsetAdjustmentBehavior="never" setSupportMultipleWindows={false} allowsBackForwardNavigationGestures={false} /></View>{refreshSnapshot ? <View pointerEvents="none" style={styles.refreshSnapshot}><Image source={{ uri: refreshSnapshot }} style={styles.refreshSnapshot} /></View> : null}{nativeNavigationVisible ? <NativeGlassNavigation cartCount={cartCount} onNavigate={navigateStorefront} /> : null}{loading ? <View pointerEvents="none" style={styles.loading}><View style={styles.loadingCard}><ActivityIndicator color="#F2683A" /><Text style={styles.loadingText}>{reloadPending.current ? "Refreshing" : "Loading NetLet"}</Text></View></View> : null}</>}</View></SafeAreaView></View>;
}

export default function App() {
  return <SafeAreaProvider><NetLetApp /></SafeAreaProvider>;
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#F3F2ED" },
  safe: { flex: 1, backgroundColor: "#F3F2ED" },
  page: { flex: 1, backgroundColor: "#F3F2ED" },
  webViewWrap: { flex: 1 },
  webView: { flex: 1, backgroundColor: "#F3F2ED" },
  refreshSnapshot: { ...StyleSheet.absoluteFillObject, zIndex: 8 },
  nativeNavigationPosition: { position: "absolute", left: 16, right: 16, zIndex: 20 },
  nativeNavigationGlass: { minHeight: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-around", borderRadius: 28, overflow: "hidden", paddingHorizontal: 5, paddingVertical: 8 },
  nativeNavigationFallback: { backgroundColor: "rgba(255, 253, 249, 0.82)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.84)", shadowColor: "#0A285A", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.17, shadowRadius: 20, elevation: 12 },
  nativeNavigationItem: { minWidth: 54, alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 3, paddingVertical: 4 },
  nativeNavigationItemPressed: { transform: [{ scale: 0.96 }], opacity: 0.72 },
  nativeNavigationLabel: { color: "#536B8C", fontSize: 12, fontWeight: "700" },
  nativeNavigationLabelActive: { color: "#0A285A", fontWeight: "900" },
  cartBadge: { position: "absolute", right: -9, top: -8, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: "#F2683A", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.9)" },
  cartBadgeText: { color: "#FFFFFF", fontSize: 9, fontWeight: "900" },
  loading: { ...StyleSheet.absoluteFillObject, zIndex: 10, alignItems: "center", justifyContent: "center", backgroundColor: "transparent" },
  loadingCard: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(213, 223, 235, 0.86)", backgroundColor: "rgba(255, 253, 249, 0.76)", paddingHorizontal: 18, paddingVertical: 13 },
  loadingText: { color: "#0A285A", fontSize: 13, fontWeight: "800" },
  failure: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 34, backgroundColor: "#F3F2ED" },
  failureTitle: { color: "#0A285A", fontSize: 23, fontWeight: "900", textAlign: "center" },
  failureCopy: { marginTop: 9, color: "#536B8C", fontSize: 13, lineHeight: 19, textAlign: "center" },
  retry: { marginTop: 21, borderRadius: 22, backgroundColor: "#F2683A", color: "#FFFDF9", fontSize: 13, fontWeight: "900", overflow: "hidden", paddingHorizontal: 18, paddingVertical: 13 },
  nativeAccount: { flex: 1, backgroundColor: "#F3F2ED", paddingHorizontal: 22 },
  nativeAccountHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  nativeAccountBack: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 21, borderWidth: 1, borderColor: "#D5DFEB", backgroundColor: "#FFFDF9" },
  nativeAccountBackText: { marginTop: -4, color: "#0A285A", fontSize: 34, fontWeight: "400" },
  nativeAccountWordmark: { color: "#0A285A", fontSize: 23, fontWeight: "900", letterSpacing: -1.1 },
  nativeAccountHeaderBalance: { width: 42, height: 42 },
  nativeAccountBody: { flex: 1, justifyContent: "center", paddingBottom: 44 },
  nativeAccountMonogram: { width: 62, height: 62, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#0A285A", shadowColor: "#0A285A", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 18 },
  nativeAccountMonogramText: { color: "#F3F2ED", fontSize: 28, fontWeight: "900" },
  nativeAccountEyebrow: { marginTop: 32, color: "#A44A2B", fontSize: 11, fontWeight: "900", letterSpacing: 1.8 },
  nativeAccountTitle: { marginTop: 12, color: "#0A285A", fontSize: 42, fontWeight: "900", letterSpacing: -2.1, lineHeight: 43 },
  nativeAccountCopy: { marginTop: 16, maxWidth: 340, color: "#536B8C", fontSize: 15, lineHeight: 22 },
  nativeAccountPrimary: { marginTop: 32, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 26, backgroundColor: "#0A285A" },
  nativeAccountPrimaryText: { color: "#FFFDF9", fontSize: 15, fontWeight: "900" },
  nativeAccountSecondary: { marginTop: 12, minHeight: 52, alignItems: "center", justifyContent: "center", borderRadius: 26, borderWidth: 1, borderColor: "#D5DFEB", backgroundColor: "#FFFDF9" },
  nativeAccountSecondaryText: { color: "#0A285A", fontSize: 15, fontWeight: "900" },
  nativeAccountFootnote: { marginTop: 20, color: "#778BA6", fontSize: 11, lineHeight: 16, textAlign: "center" },
});
