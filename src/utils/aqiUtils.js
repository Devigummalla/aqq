// EPA AQI Scale
export const EPA_AQI_SCALE = {
  0: { label: "Good", color: "success", range: "0-50" },
  1: { label: "Moderate", color: "info", range: "51-100" },
  2: { label: "Unhealthy for Sensitive Groups", color: "warning", range: "101-150" },
  3: { label: "Unhealthy", color: "danger", range: "151-200" },
  4: { label: "Very Unhealthy", color: "danger", range: "201-300" },
  5: { label: "Hazardous", color: "danger", range: "301-500" }
};

export function getAQIStatus(aqi) {
  if (aqi <= 50) return EPA_AQI_SCALE[0].label;
  if (aqi <= 100) return EPA_AQI_SCALE[1].label;
  if (aqi <= 150) return EPA_AQI_SCALE[2].label;
  if (aqi <= 200) return EPA_AQI_SCALE[3].label;
  if (aqi <= 300) return EPA_AQI_SCALE[4].label;
  return EPA_AQI_SCALE[5].label;
}

export function getAQIColor(aqi) {
  if (aqi <= 50) return EPA_AQI_SCALE[0].color;
  if (aqi <= 100) return EPA_AQI_SCALE[1].color;
  if (aqi <= 150) return EPA_AQI_SCALE[2].color;
  if (aqi <= 200) return EPA_AQI_SCALE[3].color;
  if (aqi <= 300) return EPA_AQI_SCALE[4].color;
  return EPA_AQI_SCALE[5].color;
}

export function getAQIAdvisory(aqi) {
  if (aqi <= 50) {
    return {
      headline: "Good Air Quality",
      message: "Air quality is satisfactory, and air pollution poses little or no risk."
    };
  } else if (aqi <= 100) {
    return {
      headline: "Moderate Air Quality",
      message: "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution."
    };
  } else if (aqi <= 150) {
    return {
      headline: "Unhealthy for Sensitive Groups",
      message: "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
    };
  } else if (aqi <= 200) {
    return {
      headline: "Unhealthy",
      message: "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects."
    };
  } else if (aqi <= 300) {
    return {
      headline: "Very Unhealthy",
      message: "Health warnings of emergency conditions. The entire population is more likely to be affected."
    };
  } else {
    return {
      headline: "Hazardous",
      message: "Health alert: everyone may experience more serious health effects. Emergency conditions."
    };
  }
}
