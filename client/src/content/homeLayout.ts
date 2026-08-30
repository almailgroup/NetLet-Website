export const categoryRail = [
  { label: "All departments", query: "All", color: "#dce5e9" },
  { label: "Electronics", query: "Electronics", color: "#dce5e9" },
  { label: "Home & kitchen", query: "Home & Kitchen", color: "#f5e4c9" },
  { label: "Beauty", query: "Beauty", color: "#f6d9d2" },
  { label: "Style", query: "Style", color: "#e4dfd0" },
  { label: "Grocery", query: "Grocery", color: "#dce7cf" },
] as const;

export const homeRailDefinitions = [
  { id: "deals", title: "Deals", description: "Selected price drops and just-landed finds.", treatment: "light" },
  { id: "bestsellers", title: "Bestsellers", description: "Popular choices from the NetLet edit.", treatment: "navy" },
  { id: "popular", title: "Most popular", description: "The things people keep coming back for.", treatment: "light" },
  { id: "newest", title: "Newest", description: "Fresh additions to the live catalog.", treatment: "navy" },
] as const;

export const editorialUpdates = [
  { date: "Delivery notes", title: "A calmer way to get the everyday essentials.", summary: "NetLet is designed around useful finds, clear product detail, and a Kuwait-focused checkout journey." },
  { date: "NetLet edit", title: "Small upgrades can change the rhythm of a room.", summary: "Browse our considered selection of home and personal technology pieces, all in one clean place." },
  { date: "Shopping guide", title: "From first search to bag, keep it simple.", summary: "Live search suggestions and a persistent bag make it easy to find and revisit the things you want." },
] as const;

export const footerGroups = [
  { title: "Categories", links: ["Electronics", "Home & Kitchen", "Beauty", "Style", "Grocery"] },
  { title: "Shopping", links: ["All products", "New arrivals", "Bestsellers", "Saved items"] },
  { title: "Customer service", links: ["Delivery", "Returns", "Native checkout", "Contact NetLet"] },
  { title: "NetLet", links: ["Our story", "Sell with us", "Kuwait delivery", "Account"] },
] as const;
