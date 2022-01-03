import { render, screen } from "@testing-library/react";
import Posts, { getStaticProps } from "../../pages/posts";
import { mocked } from "jest-mock";
import { getPrismicClient } from '../../services/prismic';

jest.mock("../../services/prismic");

const posts = [
  {
    slug: "my-new-post",
    title: "My new post",
    excerpt: "This is my new post",
    updatedAt: "2020-01-01",
  },
];

describe("PostsPage", () => {
  it("renders correctly", () => {
    render(<Posts posts={posts} />);
    
    expect(screen.getByText("My new post")).toBeInTheDocument();
  });

  it("loads initial data", async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: "my-new-post",
            data: {
              title: [
                {
                  type: "heading",
                  text: "My new post",
                }
              ],
              content: [
                {
                  type: "paragraph",
                  text: "This is my new post",
                }
              ],
            },
            last_publication_date: '01-02-2022',
          }
        ]
      })
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: "my-new-post",
              title: "My new post",
              excerpt: "This is my new post",
              updatedAt: "02 de janeiro de 2022",
            }
          ]
        }
      })
    )

  })
});
