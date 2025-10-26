export const getPlans = async (countyId) => {
  try {
    const url = countyId
      ? `https://ek6fo5uwig.execute-api.us-east-2.amazonaws.com/dev?county=${countyId}`
      : "https://ek6fo5uwig.execute-api.us-east-2.amazonaws.com/dev";

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data.plan_ids;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return [];
  }
};
