const path = require(`path`)
const crypto = require(`crypto`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)

const digest = data => {
  return crypto
    .createHash(`md5`)
    .update(JSON.stringify(data))
    .digest(`hex`)
}

const makeRequest = (graphql, request) =>
  new Promise((resolve, reject) => {
    // Query for nodes to use in creating pages.
    resolve(
      graphql(request).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        return result
      })
    )
  })

exports.onCreateNode = async ({ node, actions, store, cache }) => {
  const { createNode } = actions

  if (node.internal.type === "StrapiArticle") {
    // create multiple images
    if (node.images.length) {
      for (const image of node.images) {
        const fileNode = await createRemoteFileNode({
          url: "http://localhost:1337" + image.url,
          store,
          cache,
          createNode,
          createNodeId: id => String(image.id),
        })

        if (fileNode) {
          image.localFile___NODE = fileNode.id
        }
      }
    }

    // for view content from markdown
    return createNode({
      ...node,
      id: node.id + "-md",
      parent: node.id,
      children: [],
      internal: {
        type: "Article",
        mediaType: "text/markdown",
        content: node.content,
        contentDigest: digest(node),
      },
    })
  }
}
// Implement the Gatsby API “createPages”. This is called once the
// data layer is bootstrapped to let plugins create pages from data.
exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  const getArticles = makeRequest(
    graphql,
    `
    {
      allArticle {
        edges {
          node {
            id
          }
        }
      }
    }
    `
  ).then(result => {
    // Create pages for each article.
    result.data.allArticle.edges.forEach(({ node }) => {
      createPage({
        path: `/${node.id}`,
        component: path.resolve(`src/pages/article.js`),
        context: {
          id: node.id,
        },
      })
    })
  })

  const getAuthors = makeRequest(
    graphql,
    `
    {
      allStrapiUser {
        edges {
          node {
            id
          }
        }
      }
    }
    `
  ).then(result => {
    // Create pages for each user.
    result.data.allStrapiUser.edges.forEach(({ node }) => {
      createPage({
        path: `/authors/${node.id}`,
        component: path.resolve(`src/pages/author.js`),
        context: {
          id: node.id,
        },
      })
    })
  })

  // Queries for articles and authors nodes to use in creating pages.
  return Promise.all([getArticles, getAuthors])
}
