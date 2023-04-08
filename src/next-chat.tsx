import { Form, ActionPanel, Action, showToast, Detail } from "@raycast/api";
import { useState } from "react";
import { getAnswer } from "./utils/gpt";

type Values = {
  question: string;
};

export default function Command() {
  const [answer, setAnswer] = useState<string | null>(null);
  async function handleSubmit(values: Values) {
    const answer = await getAnswer(values.question);
    setAnswer(answer);
  }

  return (
    <>
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm onSubmit={handleSubmit} />
          </ActionPanel>
        }
      >
        <Form.Description text="Ask something about Next.js" />
        <Form.TextArea id="question" title="Question" placeholder="Type your question..." />
      </Form>
      {answer && <Detail markdown={answer} />}
    </>
  );
}
