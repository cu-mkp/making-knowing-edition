
export default {
  fixedFrameMode: false,
  firstPageLoad: true,
  releaseMode: process.env.REACT_APP_RELEASE_MODE,
  googleAnalyticsTrackingID: process.env.REACT_APP_GOOGLE_ANALYTICS_TRACKING_ID,
  // site content enabled/disabled flags should default to true if undefined
  contentEnabled:
    typeof process.env.REACT_APP_CONTENT_ENABLED !== "undefined"
      ? (process.env.REACT_APP_CONTENT_ENABLED === "true")
      : true,
  essaysEnabled:
    typeof process.env.REACT_APP_ESSAYS_ENABLED !== "undefined"
      ? (process.env.REACT_APP_ESSAYS_ENABLED === "true")
      : true,
  manuscriptEnabled:
    typeof process.env.REACT_APP_MANUSCRIPT_ENABLED !== "undefined"
      ? (process.env.REACT_APP_MANUSCRIPT_ENABLED === "true")
      : true,
  searchEnabled:
    typeof process.env.REACT_APP_SEARCH_ENABLED !== "undefined"
      ? (process.env.REACT_APP_SEARCH_ENABLED === "true")
      : true,
};
