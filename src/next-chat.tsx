import { Form, ActionPanel, Action, showToast, Detail } from "@raycast/api";
import { useState } from "react";
import { getAnswer } from "./utils/gpt";

type Values = {
  question: string;
};

export default function Command() {
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<{ path: string; name: string }[]>([]);

  async function handleSubmit(values: Values) {
    setIsLoading(true);
    const answer = await getAnswer(values.question);
    setAnswer(answer.text);

    const sources = answer.sourceDocuments.map((doc) => {
      const path = doc.metadata.source.split(".")[0];
      const [name] = path.split("/").slice(-1);
      return { path, name };
    });
    const uniqueSources = [...new Map(sources.map((v) => [v.path, v])).values()];
    setSources(uniqueSources);

    setIsLoading(false);
  }

  function resetAnswer() {
    setAnswer(null);
    setSources([]);
  }

  return (
    <>
      <Form
        actions={
          <ActionPanel>
            <Action.SubmitForm onSubmit={handleSubmit} />
          </ActionPanel>
        }
        isLoading={isLoading}
      >
        <Form.Description text="Ask something about Next.js" />
        <Form.TextArea id="question" title="Question" placeholder="Type your question..." />
        {isLoading && <Form.Description text="Thinking..." />}
      </Form>
      {answer && (
        <Detail
          markdown={answer}
          navigationTitle="Answer"
          actions={
            <ActionPanel>
              <Action title="New question" onAction={resetAnswer} />
            </ActionPanel>
          }
          metadata={
            <Detail.Metadata>
              {sources.map((source) => (
                <Detail.Metadata.Link
                  key={source.path}
                  title="Source:"
                  target={`https://nextjs.org/docs/${source.path}`}
                  text={source.name}
                />
              ))}
            </Detail.Metadata>
          }
        />
      )}
    </>
  );
}
