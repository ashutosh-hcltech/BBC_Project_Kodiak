from langchain_aws import ChatBedrock

messages = [
    (
        "system",
        "You are a Testing assistant, specialized in web application testing",
    ),
    ("human", "Can you create a structured list of test cases for a login screen? the output should be in markdown format with the columns test case ID, description, steps, and expected result, "),
]
model_id = 'anthropic.claude-3-5-sonnet-20240620-v1:0'
llm = ChatBedrock(
    credentials_profile_name="381492050009_LZ-Account-Users-AWS", model_id=model_id, region_name="us-east-1"
)

# Generate text
generated_text = llm.invoke(messages)
print(generated_text.content)
