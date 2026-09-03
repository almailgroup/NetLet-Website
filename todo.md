- [x] Remove the white background from the supplied NetLet logo while preserving the orange roof mark and navy wordmark.
- [x] Replace the Soukora logo asset, favicon, and visible marketplace name with NetLet.
- [x] Update branded marketplace copy and metadata to NetLet without altering the existing responsive shopping layout.
- [x] Verify the NetLet logo is legible in desktop and mobile headers.

## Verification notes

The transparent NetLet roof-mark and wordmark remain legible against the ivory desktop and mobile header surfaces. The compact mobile treatment retains the full supplied logo without its original white background.

## Pearl-white canvas update

- [x] Change the site-wide NetLet canvas from warm ivory to pearl white #F3F2ED.
- [x] Confirm text, navigation, and surface contrast remain legible on the revised background.

The pearl-white #F3F2ED canvas preserves clear separation between the navigation, warm product imagery, white search surface, and dark promotional band.

## Luxurious blue palette update

- [x] Replace the deep-brown primary, text, and promotional tones with a coordinated luxurious navy-blue family.
- [x] Preserve NetLet Orange #F2683A for actions and retain readable contrast against pearl white #F3F2ED.
- [x] Verify the new blue system across desktop navigation, hero typography, commerce controls, and mobile UI.

The deep navy surfaces and sapphire text are legible on pearl white at both desktop and mobile sizes. NetLet Orange remains reserved for action buttons, badges, and delivery highlights.

## Functional marketplace build

- [x] Enable a commerce backend for NetLet’s live catalog, cart, checkout, payments, and fulfilment.
- [x] Configure the Shopify storefront integration for NetLet’s catalog, bag, checkout, payments, and fulfilment.
- [x] Seed the initial Shopify preview catalog with two live products and verify Storefront API access.

### Browser verification notes

The live Shopify catalog loads both preview products with their published images and KWD prices. A catalog item successfully adds to the Shopify bag, opens the bag drawer, and updates the persistent bag count. Quantity updates recalculate the subtotal correctly. The responsive mobile catalog and bag entry layout were reviewed, and the approved Shopify checkout handoff was activated without entering any customer, delivery, or payment information.

The Shopify checkout handoff was confirmed for a rebuilt test bag in the current browser session. No customer information or payment data was entered, and no order was placed.

- [x] Replace the illustrative product collection with catalog-driven product browsing and search.
- [x] Implement a persistent shopping bag, product detail access, customer account actions, and checkout handoff.
- [x] Test the browse-to-bag-to-checkout journey at desktop and mobile sizes.

## Native checkout update

- [x] Replace the external Shopify checkout redirect with a native NetLet checkout mockup.
- [x] Add a Kuwait-focused checkout layout with delivery form, order summary, and KNET, Visa, Mastercard, and Google Pay visual payment icons.
- [x] Keep all payment options non-functional until the final payment-integration phase.
- [x] Verify the native checkout mockup at desktop and mobile sizes.

The native checkout displays the requested Kuwait payment brands as static visual marks on both desktop and mobile. The disabled payment action and explanatory note make it clear that no payment data is collected or processed in this mockup phase.

## Inter typography update

- [x] Replace Plus Jakarta Sans and DM Serif Display with Inter throughout NetLet.
- [x] Apply the supplied marketplace hierarchy for product headings, pricing, interactive UI, secondary labels, and body descriptions.
- [x] Verify the Inter-only type system across the storefront and native checkout at desktop and mobile sizes.

Inter now renders all NetLet text. Product titles use 18px/700 with 1.25 line height; pricing uses 16px/600 with 1.2 line height; controls use 14px/500 with 1.2 line height; labels use 12px/500 with 1.3 line height; and descriptive body text remains 14–16px/400 with 1.5 line height.

### Inter hierarchy audit

- [x] Replace broad typography overrides with reusable Inter role tokens for display headings, product titles, pricing, controls, labels, and body copy.
- [x] Apply the role tokens to the storefront, product cards, bag drawer, product detail panel, native checkout, and order summary.
- [x] Re-verify the audited Inter hierarchy at desktop and mobile sizes.

The audited Inter system is verified across both breakpoints: headings use 700, product titles use 18px/700, prices use 16–20px/600, controls use 14px/500, labels use 12px/500, and body/descriptive text uses 14–16px/400.

### Component-level Inter audit

- [x] Apply explicit Inter role classes to headings, titles, prices, controls, labels, body copy, bag content, product detail content, checkout fields, and order summary.
- [x] Remove remaining broad typography selectors and attribute-based overrides from the global stylesheet.
- [x] Re-verify component-level Inter roles across desktop and mobile storefront and checkout views.

The final component-level audit confirms explicit Inter role classes are used in product cards, bag and product-detail containers, and all checkout components. The shared stylesheet uses named Inter tokens and the established pressable control treatment without attribute-based typography overrides. Both desktop and mobile views remain legible and visually consistent.

## Interactive Mistral search

- [x] Securely configure the supplied Mistral API key for server-side NetLet search refinement.
- [x] Add rotating idle search examples that reveal one product suggestion at a time.
- [x] Add responsive live catalog suggestions for typed search queries.
- [x] Add protected Mistral query refinement that helps translate natural-language shopping requests into catalog searches.
- [x] Verify interactive search behavior, loading states, failure fallback, and keyboard flow on desktop and mobile.

### Browser verification notes

The idle search field displays rotating example products. A natural-language request opens the live suggestion panel and shows a clear local-catalog fallback with the Mistral refinement action when no exact product match is found.

The Mistral refinement action enters and exits its loading state in the browser, then converts “quiet coffee machine for morning” into the available catalog query “Brew Mini Espresso Maker”. The suggestion panel and catalog grid update to the matching live product.

After refreshing the storefront, the rotating placeholder and local no-match fallback continue to render correctly with the current live catalog.

Keyboard verification: Arrow Down highlights a live suggestion, and Enter opens the matching product-detail panel while preserving the refined query in the search field.

The refined query endpoint is protected server-side and never exposes the Mistral key to the browser. Local catalog matching remains the fallback whenever AI refinement is unavailable; desktop interaction and the compact mobile search presentation were verified.

### Search resilience validation

- [x] Simulate an AI-refinement failure and verify that NetLet preserves local suggestions and shows a clear fallback message.
- [x] Exercise the interactive search input and suggestion panel at the mobile breakpoint.

The Mistral router’s unavailable-service path is covered by a unit test, and the search component retains local catalog matching while presenting a clear fallback message. The compact mobile viewport preserves the search entry point, rotating idle placeholder, and responsive suggestion-panel layout.

### Browser-level search resilience checks

- [x] Exercise the visible AI-search fallback message while retaining local catalog suggestions.
- [x] Exercise input, suggestions, and selection behavior in a mobile browser flow.

The browser-level offline scenario confirms the visible fallback message while preserving local search controls. The compact 390px viewport keeps the same interactive search input as the desktop experience within the responsive header, with no clipping or collision against NetLet’s menu and bag controls.

The development-only offline scenario has been opened and a no-match request has activated the same live local-search panel used in normal browsing. Triggering refinement displays the explicit “AI search is temporarily unavailable” message while preserving the field, clear control, and local-catalog fallback. A locally matching query for “espresso” shows the Brew Mini Espresso Maker suggestion before the simulated refinement outage, ready for selection.

### Mobile search-panel polish

- [x] Prevent the focused mobile search suggestion panel from clipping its product labels and AI-refinement control.
- [x] Re-verify the focused mobile suggestion state after the responsive layout correction.

At 390px, the focused suggestion overlay now spans the available viewport rather than the narrow input width. The complete Brew Mini Espresso Maker label, category, and “Refine with NetLet AI” control remain visible and usable.

## Header alignment refinement

- [x] Remove the “Try it” helper text from NetLet’s search field.
- [x] Group notification, wishlist, account, and bag controls at the far right of the desktop header.
- [x] Verify the updated desktop header and unchanged compact mobile controls.

The desktop search field no longer displays its helper text, and the notification, wishlist, account, and bag controls now form a dedicated right-aligned utility group. The compact mobile header retains its balanced menu, search, and bag controls.

## Header spacing and logo scale refinement

- [x] Shift the desktop delivery location and search field slightly right.
- [x] Increase the displayed NetLet logo size modestly without crowding the desktop utility controls.
- [x] Verify the refined header balance at desktop and mobile sizes.

## Language selector placement

- [x] Replace the desktop navigation’s “Native Kuwait checkout” label with the language selector.
- [x] Preserve the language-selector action and compact header layout.
- [x] Verify the desktop and compact header after the language-selector move.

## Announcement-bar removal

- [x] Remove the top NetLet announcement bar from the storefront header.
- [x] Verify the simplified header spacing and navigation at desktop and mobile sizes.

The larger NetLet logo now naturally shifts the delivery and search area slightly right on desktop. The announcement bar is removed, and the language selector occupies the former checkout-label position in the desktop navigation; the compact header remains clean and balanced.

## Mobile search and Account navigation

- [x] Move the mobile search field onto a row below the NetLet logo while preserving the desktop header layout.
- [x] Add a dedicated NetLet Account page with sign-in-aware account actions.
- [x] Update mobile navigation to Home, Browse, Saved, Account, and Bag, with Account opening the Account page.
- [x] Verify the mobile header, bottom navigation, and account route at compact size.

At 390px, the search field occupies its own full-width row beneath the logo and menu controls. The bottom navigation visibly follows the requested Home, Browse, Saved, Account, and Bag order, and the Account route presents the expected sign-in-aware screen.

The live `/account` route loads successfully and retains a clear return-to-shopping action. The five-item compact navigation supplies the Account destination using the same route.

### Mobile Account navigation validation

- [x] Exercise the compact bottom-navigation Account item and confirm it opens the Account route.
- [x] Record the usable compact navigation order: Home, Browse, Saved, Account, and Bag.

At a true 390px touch viewport, the bottom navigation reports Home, Browse, Saved, Account, and Bag in order. Activating Account opens `/account` and renders the NetLet Account screen.

## Compact header-control refinement

- [x] Remove the top-right bag control from the mobile header while retaining Bag in bottom navigation.
- [x] Center the NetLet logo within the compact header.
- [x] Increase the compact menu icon size slightly.
- [x] Verify the mobile header, search row, and bottom navigation remain balanced.

At 390px, the NetLet logo is centered in the compact header, the enlarged menu control is clear at the left, and the top-right bag control is removed. Bag remains available in the five-item bottom navigation, while the desktop header retains its standard bag control.

## Mobile search-panel alignment correction

- [x] Give the compact search wrapper an explicit full-width boundary.
- [x] Make the active suggestion panel explicitly fill and align to that boundary.
- [x] Verify active search results at a compact mobile viewport.

At 390px, a live Espresso Maker result panel now shares the exact left and right bounds of the search field. The compact panel remains readable above the hero without extending unevenly across the viewport.

## Responsive home-layout reorganization

- [x] Reorganize the home screen into distinct Deals, Bestsellers, Most popular, and Newest product rails without changing NetLet’s existing visual language.
- [x] Add responsive category shortcuts, editorial news content, app-promotion and store-discovery blocks, plus a structured marketplace footer.
- [x] Keep live catalog browsing, product detail, bag, search, and native checkout interactions connected across the new layout.
- [x] Verify the new home hierarchy at desktop and compact mobile sizes.

The desktop storefront now progresses from the retained NetLet hero into Deals, alternating curated product rails, category shortcuts, useful-reading cards, delivery and app-support blocks, a Kuwait trust band, and a structured navy footer. At 390px, the same hierarchy folds into scrollable product rails and stacked support cards while preserving the centered compact header, separate search row, and five-item bottom navigation.

### Rail composition and catalog-state refinement

- [x] Differentiate product rails with curated collection support cards when the live catalog has only a small number of products.
- [x] Add explicit loading, empty, and error states to the Deals surface instead of presenting fallback pseudo-product content.
- [x] Re-verify the refined rail hierarchy at desktop and compact mobile sizes.

The live two-product catalog is now paired with clearly labelled collection-support cards rather than duplicate product cards within each rail. Deals presents dedicated loading, empty, and retryable error states; desktop and 390px views retain clear card hierarchy, scrollable rails, and the existing mobile navigation.

## Footer logo refinement

- [x] Create a transparent white-wordmark footer asset matched to the supplied NetLet logo treatment.
- [x] Use the resulting white-wordmark asset only in the navy footer.
- [x] Verify footer logo contrast and retain the existing header logo.

The footer now uses a transparent-background recreation of the supplied white NetLet wordmark and orange roof mark, maintaining clear contrast on the navy footer. The original transparent navy-wordmark logo remains in the header. Direct reference-image editing could not complete in the available asset pipeline, so this is not a pixel-for-pixel file edit of the uploaded source.

## Companion Expo iOS app

- [x] Create a native Expo app that carries the current NetLet marketplace visual system into iOS.
- [x] Implement native discovery, catalog, saved, account, and bag entry points with mobile-first interactions.
- [x] Prepare a testable Expo Go development link and document its temporary access requirements.

The companion Expo app at `/home/ubuntu/netlet-expo` implements NetLet’s pearl, navy, and orange mobile marketplace design with a search/filterable preview catalog, saved state, local bag quantities, account entry, product details, native bottom navigation, and Kuwait checkout prompt. The iOS bundle exports successfully and catalog tests pass. The active temporary Expo Go tunnel is `exp://vdpkklk-anonymous-8081.exp.direct`; it remains reachable only while the development session is running.

### Expo Go compatibility correction

- [x] Rebuild the companion app on the Expo SDK supported by the user’s Expo Go installation.
- [x] Revalidate the iOS JavaScript bundle and create a replacement Expo Go tunnel.
- [x] Verify the new project link advertises the compatible SDK version.

The compatibility replacement resides at `/home/ubuntu/netlet-expo-sdk54` and pins `expo@54.0.37`. Type checking, the two catalog tests, and an iOS bundle export pass. The active replacement tunnel is `exp://h04pwoy-anonymous-8081.exp.direct`; it is intended for Expo Go installations compatible with SDK 54 and remains available while this development session is running.

## Mobile web parity rebuild

- [x] Recreate the mobile web home hierarchy in Expo: compact header, separate search row, hero, deals, product rails, category shortcuts, editorial cards, support blocks, trust band, footer, and fixed five-item navigation.
- [x] Match mobile-web card proportions, rail density, colour application, labels, and footer treatment without reducing the content to a native-only summary.
- [x] Preserve product detail, saved items, local bag, account entry, search/filter behavior, and the compatible Expo Go session.
- [x] Validate the rebuilt app bundle and provide the refreshed test link.

The Expo SDK 54 home screen now carries the full mobile-web marketplace rhythm rather than a reduced native summary: centered compact branding and separate search panel, hero, Deals, Bestsellers, Most popular, Newest, categories, reading cards, app and delivery support blocks, trust band, navy footer, and fixed five-item navigation. The existing product detail, saved, bag, account, and search interactions remain connected. Type checking, catalog tests, and iOS bundle export pass; the refreshed tunnel remains `exp://h04pwoy-anonymous-8081.exp.direct` while this session is active.

## Direct iOS mobile-web clone

- [x] Replace the approximate Expo mobile home treatment with a direct clone of the current NetLet mobile web screen.
- [x] Match the reference composition precisely: header/logo geometry, search dimensions, hero crop, type scale, button positions, content scroll start, and floating five-item navigation.
- [x] Keep the same visual system and real connected interactions without adding alternate native-only sections to the initial cloned view.
- [x] Validate the rebuilt Expo screen and refresh the temporary Expo Go preview.

The Expo SDK 54 app now renders the published responsive NetLet storefront inside an iOS WebView, removing the previously approximate native home screen. This gives it the exact mobile web header, search behavior, hero geometry, typography, product rails, drawer interactions, checkout mockup, footer, and floating five-item navigation. The direct storefront URL contract, catalog tests, TypeScript check, and iOS bundle export pass. The refreshed Expo Go tunnel remains `exp://h04pwoy-anonymous-8081.exp.direct` while this session is active.

## Bottom-navigation haptic feedback

- [x] Trigger approximately 50% strength haptic feedback on each iOS bottom-navigation icon tap.
- [x] Preserve the embedded NetLet mobile-web behavior and visual clone.
- [x] Validate the haptic-enabled Expo SDK 54 iOS bundle and refresh the Expo Go session.

The iOS wrapper now injects a scoped bridge into the published mobile storefront. Taps on Home, Browse, Saved, Account, or Bag trigger Expo Haptics `ImpactFeedbackStyle.Medium`, which represents the requested roughly 50% feedback level, while the website retains its identical visible behavior. Type checking, four unit tests, and the iOS bundle export pass; the refreshed temporary tunnel is `exp://h04pwoy-anonymous-8081.exp.direct`.

## iOS haptic hierarchy and staged refresh feedback

- [x] Add light feedback for low-commitment controls and medium feedback for shopping actions inside the embedded storefront.
- [x] Add staged pull-to-refresh pulses before the native refresh threshold, followed by a confirmation haptic and page reload.
- [x] Preserve the exact mobile website visuals and navigation while augmenting touch feedback natively.
- [x] Validate the haptic-enabled iOS bundle and refreshed Expo Go session.

The native bridge now applies light selection feedback to saves and low-commitment controls, medium feedback to bottom navigation and add-to-bag/checkout actions, and a success notification after the bag count increases. When the mobile storefront is at the top, a pull down produces three progressively stronger tactile pulses at approximately 28, 60, and 94 points, then a success haptic and page refresh when released beyond the final threshold. Five tests, TypeScript, and the iOS bundle export pass; the active tunnel remains `exp://h04pwoy-anonymous-8081.exp.direct`.

## Bottom-edge Liquid Glass navigation

- [x] Remove the white iOS bottom safe-area strip beneath the embedded storefront.
- [x] Lower the mobile navigation to the true bottom edge while retaining safe touch clearance.
- [x] Apply a translucent, blurred Liquid Glass treatment to the embedded mobile navigation.
- [x] Validate the refined bottom-edge presentation in the Expo SDK 54 iOS bundle.

The iOS wrapper now applies the safe area only to the top and side edges, allowing the WebView to extend cleanly to the device bottom. The embedded mobile navigation is lowered to `max(4px, safe-area inset)` and receives a scoped Liquid Glass treatment: translucent pearl tint, saturation and brightness lift, 28px blur, bright inner edge, and a soft elevation shadow. Type checking, six tests, and the iOS bundle export pass; the active tunnel is `exp://h04pwoy-anonymous-8081.exp.direct`.

## Dynamic Island safe-area and Liquid Glass correction

- [x] Restore the top safe-area inset so the NetLet header and logo clear the iPhone Dynamic Island.
- [x] Preserve the corrected bottom-edge navigation placement without the white strip.
- [x] Replace the approximate glass styling with an implementation aligned to the Apple Liquid Glass documentation supplied by the user.
- [x] Validate the corrected iOS composition and refreshed Expo Go preview.

Apple’s guidance was applied by restoring a `SafeAreaProvider` around the top-and-side inset, so the embedded NetLet header no longer renders under the Dynamic Island. The previous CSS-only bar is replaced by a native interactive Expo `GlassView` overlay: the web navigation is hidden only at compact widths, its real actions remain forwarded to the storefront, and the native layer uses the system Liquid Glass material when iOS 26 exposes the API. It falls back to a restrained translucent surface on unsupported system versions. The bottom white strip remains removed. Type checking, six unit tests, and iOS bundle export pass; the refreshed Expo Go tunnel is `exp://h04pwoy-anonymous-8081.exp.direct`.

## Native Glass navigation redirection correction

- [x] Make Home reliably return to the root storefront from Account and Checkout.
- [x] Keep Browse, Saved, Account, and Bag actions functional through the native Glass menu bridge.
- [x] Validate all five menu actions against the embedded storefront routes.

The native navigation bridge is now route-aware. Account opens `/account` directly; Home, Browse, Saved, and Bag first return to the root storefront when required, persist the intended action across that route transition, then invoke the matching hidden mobile-web control after it renders. This ensures Home reliably returns from Account or Checkout and the remaining four navigation actions retain their original website behavior. Type checking, six tests, and iOS bundle export pass; the refreshed tunnel is `exp://h04pwoy-anonymous-8081.exp.direct`.

## Browse transition and refresh-overlay polish

- [x] Add a smooth, reduced-motion-aware slide transition when the Browse sidebar opens and closes.
- [x] Change the refresh indicator label from “Refreshing NetLet” to “Refreshing.”
- [x] Preserve the visible storefront behind a subtle refresh indicator rather than an opaque white loading screen.
- [x] Validate the refined interactions in the Expo SDK 54 iOS bundle.

The compact Browse panel now enters with a 240ms left-to-right slide and an 180ms scrim fade, both disabled automatically for reduced-motion preferences. During pull refresh, the previous storefront remains visible behind a translucent indicator card labelled “Refreshing”; the opaque white loading surface is now reserved for the initial page load only. NetLet web checks and tests plus Expo TypeScript, six tests, and iOS bundle export pass. The refreshed tunnel remains `exp://h04pwoy-anonymous-8081.exp.direct`.

## Expo Go preview delivery correction

- [x] Verify that the running Expo bundle contains the Browse transition and transparent refresh-overlay updates.
- [x] Clear stale Metro state and restart a fresh Expo Go tunnel.
- [x] Confirm a new test link serves the updated bundle before delivery.

The wrapper source and cache-cleared Metro bundle both contain the concise “Refreshing” label; the mobile storefront source includes the new Browse slide and scrim animation hooks. The previous Expo session was stopped. A fresh tunnel now serves from port 8082 at `exp://h04pwoy-anonymous-8082.exp.direct`, forcing Expo Go to download a newly rebuilt bundle instead of resuming the prior 8081 session.

## Refresh persistence and Browse dismissal correction

- [x] Keep the previous WebView snapshot visible during refresh so no blank or white state replaces the storefront.
- [x] Make native Browse toggle the embedded Browse sidebar closed when tapped a second time.
- [x] Make Home close the embedded Browse sidebar before returning to the root storefront.
- [x] Validate the corrected interaction bundle through a new Expo Go session.

Before WebView reload, the iOS wrapper now captures the visible storefront and overlays that snapshot during refresh, keeping the actual page composition visible beneath the concise “Refreshing” indicator. The injected bridge now explicitly closes the compact sidebar when Home is selected, treats a second Browse selection as a close action, and closes it before any other root navigation. Type checking, six tests, and the iOS bundle export pass. A distinct cache-cleared session is available at `exp://h04pwoy-anonymous-8083.exp.direct`.

## Page-aware native navigation correction

- [x] Hide the native Glass navigation on Bag, Account, and Checkout views so it cannot block page-level buttons.
- [x] Preserve an unobstructed checkout action and bag summary controls.
- [x] Make every native menu tab reliably open, close, and re-open its corresponding storefront destination.
- [x] Validate the page-aware navigation rules and a fresh Expo Go session.

The native Glass layer now listens to page context from the embedded storefront and is visible only on the root browsing surface. It hides when the Bag drawer, Account route, or Checkout route is active, so checkout and page-level controls remain unobstructed. Route-state changes also hide the layer immediately during navigation, and all root destinations continue to be forwarded through the real website controls. Type checking, six tests, and iOS bundle export pass. With the tunnel provider unavailable, a verified alternative public Metro route serves the manifest and iOS bundle from `exp://8085-igt3zwe81ntxax1go2cgi-a3ca7c30.us3.manus.computer`.

## Cross-platform non-payment upgrades

- [x] Add persistent saved items and bag-state continuity across the NetLet web storefront and iOS wrapper.
- [x] Add a Kuwait delivery-zone selector and clear delivery estimates without enabling payment processing.
- [x] Add native product sharing, Arabic/RTL localisation, notification foundations, and order-tracking foundations across web and iOS.
- [x] Use Shopify Admin as the approved live catalog workflow; product creation and removal are performed directly in Shopify without fabricating merchandise or customer content.
- [x] Validate the complete non-payment upgrade across responsive web and the Expo iOS wrapper.

### Native iOS account access and unconfigured operational foundations

- [x] Replace the WebView Account destination in iOS with a native sign-in/sign-up screen that returns to the storefront after access is completed.
- [x] Make delivery-zone, notification, and tracking foundations explicit about values awaiting operational configuration rather than presenting invented logistics or customer data.

The customer foundation now persists guest saved items and delivery selection locally, then synchronises supported preferences after sign-in. Authenticated customer profiles retain saved products, selected governorate, notification preferences, and a Shopify cart reference. Live product expansion, delivery pricing/ETA, device push delivery, and courier/order events deliberately remain unconfigured until NetLet supplies operational inputs.

## Secure admin catalog panel

- [x] Not pursued: user selected Shopify Admin rather than a separate NetLet admin route.
- [x] Not pursued: product CRUD remains in Shopify Admin, which is NetLet’s catalog source of truth.
- [x] Not pursued: Shopify’s native product forms and draft/publish controls provide catalog administration.
- [x] Confirm the existing Storefront API workflow displays Shopify-published products to NetLet shoppers.

## Shopify catalog source confirmation

- [x] Confirmed: retain the existing NetLet-connected Shopify store; the user now has Shopify Admin access to its live catalog.
- [x] Not pursued: do not switch to `003n8k-es.myshopify.com`; add products only in the existing NetLet-connected store.

## Dedicated product pages

- [x] Replace product detail pop-ups with accessible `/products/:handle` pages backed by live Shopify product data.
- [x] Preserve product images, variants, saved state, and add-to-bag actions on the page.
- [x] Show a related-products rail using relevant live catalog items beneath the product information.
- [x] Verify direct links, browser back navigation, mobile layout, and bag behavior across product pages.

## Product image gallery

- [x] Add visible previous/next controls and selectable image thumbnails to product-page galleries.
- [x] Support left/right keyboard arrow navigation without interfering with form controls.
- [x] Verify gallery navigation across desktop, keyboard, and mobile layouts.

## Gallery arrow refinement

- [x] Replace round image-gallery arrow buttons with icon-only controls that highlight on hover and focus.
- [x] Verify the refined controls preserve accessible labels and existing navigation behavior.

## Header utility placement

- [x] Position the delivery-area and language controls directly beneath the desktop Bag button as a stable utility group.
- [x] Preserve delivery selection, Arabic/RTL switching, and responsive mobile header behavior.
- [x] Verify the header group aligns without overlapping navigation or content at desktop and mobile widths.

## Navigation-row utility correction

- [x] Move the delivery-area and language controls from beneath Bag into the desktop row containing All departments.
- [x] Keep the utilities right-aligned in that row and preserve their functional delivery and locale actions.
- [x] Verify the corrected desktop alignment and unchanged compact mobile header.

## Header account-control grouping correction

- [x] Restore the notification, saved, and account controls directly beside the desktop Bag button.
- [x] Preserve the delivery-area and language controls in the All departments navigation row.
- [x] Verify the top-right header grouping and mobile behavior after the correction.

## Requirements assessment

- [x] Extract and categorise the supplied NetLet product requirements.
- [x] Compare each requirement with the current live NetLet website and iOS companion foundations.
- [x] Produce a prioritised delivery plan with dependencies, unanswered questions, and items that require operational inputs.

## Website and app improvement roadmap

- [x] Review current website and iOS customer journeys against the intended marketplace experience.
- [x] Identify high-impact improvements across catalog discovery, product confidence, account, fulfilment, and native app experience.
- [x] Deliver a prioritised roadmap with dependencies and recommended implementation sequence.

## First customer-value improvement wave

- [x] Add live-catalog sorting and clear category/availability discovery controls without fabricating inventory information.
- [x] Improve product confidence with image zoom and a product-information surface derived only from live Shopify data.
- [x] Preserve existing saved, share, variant, bag, delivery, Arabic/RTL, and non-payment checkout behaviour.
- [x] Verify responsive catalogue discovery and product-page interactions across desktop and mobile.
- [x] Replace unconfigured delivery-speed and payment-readiness marketing claims with accurate live-catalog and preference messaging.

Live verification: the two-image Instax page resolves after its initial loading skeleton, with image thumbnails/arrows, image-zoom entry, and Shopify-derived category, brand, options, and description displayed correctly.

## Structured Shopify product attributes

- [x] Extend the normalized Shopify storefront contract with structured product attributes from authoritative Shopify data.
- [x] Render populated structured attributes clearly on NetLet product-information pages.
- [x] Show an accurate empty state when a product has no structured attributes configured.
- [x] Verify populated and empty attribute states without changing the existing catalog connection or payment behavior.

The current live catalog has no configured custom attribute values, so the deployed product page correctly shows “Not configured.” The populated path is covered by the normalizer test and will render automatically when supported `custom` metafields are added in Shopify.

## Specifications table styling

- [x] Restyle populated Shopify specifications as a clean two-column alternating-color table.
- [x] Preserve the accessible empty state and responsive readability for products without configured attributes.
- [x] Verify the table visual treatment on desktop and mobile product pages.

The current live catalog has no configured custom attributes, so the empty state remains the verified runtime view; populated rows use the same table when Shopify values are present.

## Full source delivery

- [x] Verify the current web and retained iOS source trees included in the latest project version.
- [x] Deliver the complete NetLet source package with concise setup guidance and secret-handling notes.

Source note: the latest project version includes the web storefront, server/shared commerce foundations, tests, and `ios-app/` Expo companion source. Runtime secrets are intentionally excluded from source and remain project-managed environment values.
