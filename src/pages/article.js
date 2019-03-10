import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"
import Layout from "../components/layout"

const ArticleTemplate = ({ data }) => (
  <Layout>
    <h1>{data.article.title}</h1>
    {/* пока без автора  */}
    {/* <p>
      by{" "}
      <Link to={`/authors/User_${data.article.author.id}`}>
        {data.article.author.username}
      </Link>
    </p> */}
    <Img fluid={data.article.image.childImageSharp.fluid} />
    <p
      dangerouslySetInnerHTML={{
        __html: data.article.childMarkdownRemark.html,
      }}
    />

    {data.article.images &&
      data.article.images.map(image => (
        <Img key={image.name} fixed={image.localFile.childImageSharp.fixed} />
      ))}
  </Layout>
)

export default ArticleTemplate

export const query = graphql`
  query ArticleTemplate($id: String) {
    article(id: { eq: $id }) {
      title
      childMarkdownRemark {
        html
      }
      image {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
      images {
        name
        localFile {
          childImageSharp {
            fixed(width: 200, height: 125) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
      author {
        id
        username
      }
    }
  }
`
