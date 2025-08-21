/**
 * Utility function to create chatbox user payload
 * Always includes chatbotCharacteristics field, even when empty
 */

interface CustomizeSettings {
  userName: string;
  chatbotCharacteristics: string[];
  additionalInfo: string;
}

interface ChatboxUserPayload {
  userName: string;
  additionalInfo: string;
  chatbotCharacteristics: string[];
}

export function createChatboxUserPayload(
  customizeSettings: CustomizeSettings
): ChatboxUserPayload {
  const payload: ChatboxUserPayload = {
    userName: customizeSettings.userName || "",
    additionalInfo: customizeSettings.additionalInfo || "",
    chatbotCharacteristics: [], // Always include this field
  };

  // Luôn thêm chatbotCharacteristics, ngay cả khi rỗng
  if (
    customizeSettings.chatbotCharacteristics &&
    customizeSettings.chatbotCharacteristics.length > 0
  ) {
    // Giới hạn tối đa 2 characteristics
    const limitedCharacteristics =
      customizeSettings.chatbotCharacteristics.slice(0, 2);
    payload.chatbotCharacteristics = [...limitedCharacteristics];
  }
  // Nếu không có characteristics nào được chọn, chatbotCharacteristics sẽ là mảng rỗng []

  return payload;
}

// Test cases for validation
export function testChatboxPayloadLogic() {
  console.log("=== Testing Chatbox Payload Logic ===");

  // Test case 1: No characteristics selected
  const settingsWithoutCharacteristics: CustomizeSettings = {
    userName: "John Doe",
    chatbotCharacteristics: [],
    additionalInfo: "I am a developer",
  };

  const payloadWithoutCharacteristics = createChatboxUserPayload(
    settingsWithoutCharacteristics
  );
  console.log("Test 1 - No characteristics:");
  console.log("Input:", settingsWithoutCharacteristics);
  console.log("Output:", payloadWithoutCharacteristics);
  console.log(
    "Has chatbotCharacteristics field:",
    "chatbotCharacteristics" in payloadWithoutCharacteristics
  );
  console.log(
    "chatbotCharacteristics value:",
    payloadWithoutCharacteristics.chatbotCharacteristics
  );
  console.log("---");

  // Test case 2: With characteristics selected
  const settingsWithCharacteristics: CustomizeSettings = {
    userName: "Jane Smith",
    chatbotCharacteristics: ["friendly", "professional"],
    additionalInfo: "I am a designer",
  };

  const payloadWithCharacteristics = createChatboxUserPayload(
    settingsWithCharacteristics
  );
  console.log("Test 2 - With characteristics:");
  console.log("Input:", settingsWithCharacteristics);
  console.log("Output:", payloadWithCharacteristics);
  console.log(
    "Has chatbotCharacteristics field:",
    "chatbotCharacteristics" in payloadWithCharacteristics
  );
  console.log(
    "chatbotCharacteristics value:",
    payloadWithCharacteristics.chatbotCharacteristics
  );
  console.log("---");

  // Test case 3: Empty string userName
  const settingsWithEmptyUserName: CustomizeSettings = {
    userName: "",
    chatbotCharacteristics: ["helpful"],
    additionalInfo: "",
  };

  const payloadWithEmptyUserName = createChatboxUserPayload(
    settingsWithEmptyUserName
  );
  console.log("Test 3 - Empty userName:");
  console.log("Input:", settingsWithEmptyUserName);
  console.log("Output:", payloadWithEmptyUserName);
  console.log(
    "Has chatbotCharacteristics field:",
    "chatbotCharacteristics" in payloadWithEmptyUserName
  );
  console.log(
    "chatbotCharacteristics value:",
    payloadWithEmptyUserName.chatbotCharacteristics
  );

  // Test case 4: More than 2 characteristics (should be limited to 2)
  const settingsWithManyCharacteristics: CustomizeSettings = {
    userName: "Bob Wilson",
    chatbotCharacteristics: [
      "friendly",
      "professional",
      "creative",
      "analytical",
    ],
    additionalInfo: "I work with many projects",
  };

  const payloadWithManyCharacteristics = createChatboxUserPayload(
    settingsWithManyCharacteristics
  );
  console.log("Test 4 - More than 2 characteristics:");
  console.log("Input:", settingsWithManyCharacteristics);
  console.log("Output:", payloadWithManyCharacteristics);
  console.log(
    "chatbotCharacteristics length:",
    payloadWithManyCharacteristics.chatbotCharacteristics.length
  );

  console.log("=== End Testing ===");
}
