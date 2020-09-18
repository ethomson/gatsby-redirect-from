"use strict";

const path = require('path');

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPages = createPages;

var _chalk = _interopRequireDefault(require("chalk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPages({
  graphql,
  actions
}, pluginOptions) {
  const {
    createRedirect
  } = actions;
  const markdownQuery = pluginOptions.query || 'allMarkdownRemark';
  return new Promise((resolve, reject) => {
    resolve(graphql(`
          {
            q: ${markdownQuery}(
              filter: { frontmatter: { redirect_from: { ne: null } } }
            ) {
              edges {
                node {
                  frontmatter {
                    redirect_from
                  }
                  parent {
                    ... on File {
                      relativeDirectory
                      name
                    }
                  }
                }
              }
            }
          }
        `).then(result => {
      if (result.errors) {
        console.log(result.errors); // eslint-disable-line no-console

        reject(result.errors);
      }

      const allPosts = result.data.q.edges;
      const redirects = []; // For all posts with redirect_from frontmatter,
      // extract all values and push to redirects array

      allPosts.forEach(post => {
        const toPath = '/' + path
          .join(
            post.node.parent.relativeDirectory,
            post.node.parent.name === 'index' ? '/' : post.node.parent.name,
          )
          .replace(/\\/g, '/') // Convert Windows backslash paths to forward slash paths: foo\\bar → foo/bar

        redirects.push({
          from: post.node.frontmatter.redirect_from,
          to: toPath
        });
      }); // Create redirects from the just constructed array

      redirects.forEach(({
        from,
        to
      }) => {
        // iterate through all `from` array items
        from.forEach(from => {
          createRedirect({
            fromPath: from,
            toPath: to,
            isPermanent: true,
            redirectInBrowser: true
          });
        });
      });
      resolve(console.log(`${_chalk.default.green('success')} create redirects`) // eslint-disable-line no-console
      );
    }));
  });
}
