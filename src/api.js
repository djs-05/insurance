const BASE_URL = "https://ek6fo5uwig.execute-api.us-east-2.amazonaws.com/dev";

// Generate a new UUID for each request
const getSessionUUID = () => {
  return crypto.randomUUID();
};

export const getPlans = async (countyId) => {
  try {
    const sessionId = getSessionUUID();
    const url = countyId
      ? `${BASE_URL}?county=${countyId}&sessionId=${sessionId}`
      : `${BASE_URL}?sessionId=${sessionId}`;

    console.log("=== GET PLANS REQUEST ===");
    console.log("Session ID:", sessionId);
    console.log("County ID:", countyId);
    console.log("URL:", url);

    const response = await fetch(url);
    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    const rawText = await response.text();
    console.log("Raw response text:", rawText);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = JSON.parse(rawText);
    console.log("Parsed data:", data);
    console.log("Plan IDs:", data.plan_ids);
    console.log("=== END GET PLANS ===\n");

    return data.plan_ids;
  } catch (error) {
    console.error("ERROR in getPlans:", error);
    console.error("Error stack:", error.stack);
    return [];
  }
};

// Poll the /ping endpoint for the response
// 5 minutes = 300 seconds = 150 attempts at 2 second intervals
const pollForResponse = async (uuid, maxAttempts = 150, interval = 2000) => {
  console.log("=== STARTING POLLING ===");
  console.log("UUID:", uuid);
  console.log("Max attempts:", maxAttempts);
  console.log("Interval:", interval, "ms");

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const pollUrl = `${BASE_URL}/ping?uuid=${uuid}`;
      console.log(`\n--- Polling attempt ${attempt + 1}/${maxAttempts} ---`);
      console.log("Poll URL:", pollUrl);

      const response = await fetch(pollUrl);
      console.log("Poll response status:", response.status);
      console.log("Poll response ok:", response.ok);

      const rawText = await response.text();
      console.log("Raw poll response:", rawText);

      if (!response.ok) {
        console.log(`Response not ok (status ${response.status}), retrying...`);
        await new Promise((resolve) => setTimeout(resolve, interval));
        continue;
      }

      const data = JSON.parse(rawText);
      console.log("Parsed poll data:", data);
      console.log("Status:", data.status);
      console.log("Has reply:", !!data.reply);

      if (data.status === "ok" && data.reply) {
        console.log("=== REPLY RECEIVED ===");
        console.log("Final reply:", data.reply);
        console.log("=== END POLLING (SUCCESS) ===\n");
        return data.reply;
      }

      console.log("No reply yet, waiting before next attempt...");
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed with error:`, error);
      console.error("Error details:", error.message);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  console.error("=== POLLING TIMEOUT ===");
  throw new Error("Polling timeout: No response received");
};

export const sendChatMessage = async (newMessage, planIds) => {
  const sessionId = getSessionUUID();

  console.log("\n=== SEND CHAT MESSAGE ===");
  console.log("Session ID:", sessionId);
  console.log("New message:", newMessage);
  console.log("Current plan IDs:", planIds);

  const postUrl = `${BASE_URL}/bot`;
  const requestBody = {
    uuid: sessionId,
    planIds: planIds,
    newMessage: newMessage,
  };

  console.log("POST URL:", postUrl);
  console.log("Request body:", JSON.stringify(requestBody, null, 2));

  // Fire off the POST request without waiting for it
  console.log("Firing POST request (not waiting for response)...");
  fetch(postUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })
    .then((response) => {
      console.log("POST response received (background):", response.status);
      return response.text();
    })
    .then((text) => {
      console.log("POST raw response (background):", text);
    })
    .catch((error) => {
      console.log(
        "POST request error (expected, processing in background):",
        error
      );
      console.log("Error message:", error.message);
    });

  // Immediately start polling for the response
  console.log("\nImmediately starting polling...");
  return await pollForResponse(sessionId);
};
