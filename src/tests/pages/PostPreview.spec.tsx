import { render, screen } from "@testing-library/react";
import PostPreview, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { mocked } from "jest-mock";
import { getPrismicClient } from "../../services/prismic";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";

jest.mock("../../services/prismic");
jest.mock("next-auth/client");
jest.mock("next/router");

const post = {
  slug: "my-new-post",
  title: "My new post",
  content: "<p>This is my new post</p>",
  updatedAt: "2020-01-01",
};

describe("PostPreviewPage", () => {
  it("renders correctly", () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<PostPreview post={post} />);

    expect(screen.getByText("My new post")).toBeInTheDocument();
    expect(screen.getByText("This is my new post")).toBeInTheDocument();
    expect(screen.getByText("Want to continue reading?")).toBeInTheDocument();
  });

  it("redirects user to full post subscription is found", async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMock = jest.fn();

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: 'fake-active-subscription',
      },
      false
    ] as any);
    
    useRouterMocked.mockReturnValueOnce({
      push: pushMock,
    } as any);
    
    render(<PostPreview post={post} />);
    
    expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
  });
  
  it("loads intial data ", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {
              type: "heading",
              text: "My new post",
            },
          ],
          content: [
            {
              type: "paragraph",
              text: "This is my new post",
            }
          ]
        },
        last_publication_date: "01-02-2022",
      }),
    } as any);

    const response = await getStaticProps({
      params: {
        slug: "my-new-post",
      }
    });
    
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: "my-new-post",
            title: "My new post",
            content: "<p>This is my new post</p>",
            updatedAt: "02 de janeiro de 2022",
          }
        }
      })
    );
  })
});
