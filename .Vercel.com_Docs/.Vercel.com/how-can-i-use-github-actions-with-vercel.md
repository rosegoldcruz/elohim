::::::::::::::::::::::::: {.border-solid .border-b .border-0 .border-[var(--ds-gray-alpha-400)] .mb-[90px] role="main"}
:::::::::::::::::::::::: guides_backgroundColor__i2q6n
::::::::::::::::::::::: guides_containerGuidePage__dP5z8
:::::::::::::::::: guides_childContainer__t7lik
::: h-[48px]
[[← Back to Guides]{.small}](/guides){.link_link__hbWKh
.link_secondary__F1rqx zone="same"}
:::

::: {.linked-heading_hasDescription__CyYiJ .linked-heading_container__iwdxj}
# []{#how-can-i-use-github-actions-with-vercel .linked-heading_target__xscdv .linked-heading_offsetTop__uAoyO}[How can I use GitHub Actions with Vercel?]{.linked-heading_title__mCMLh .[&>p]:m-0} {#how-can-i-use-github-actions-with-vercel .text_wrapper__i87JK .linked-heading_header__YpMmf .headings_heading__DRlSP data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2.5rem;--text-line-height:3.5rem;--text-letter-spacing:-0.058125rem;--text-weight:600" components-heading="true"}

[Learn how to use GitHub Actions to deploy to Vercel including support
for GitHub Enterprise Server.]{.linked-heading_description__ijcxY}
:::

:::::: {.flex .flex-col .md:flex-row .mt-10 .md:items-center .justify-between}
:::: lastupdated_lastUpdatedSection__h385Y
::: lastupdated_lastUpdatedText__K8mlx
Last updated on October 8, 2024
:::
::::

::: {.flex .flex-wrap .items-center .md:mt-0 .mt-2}
[[Build, Deployment & Git]{.badge_contentContainer__khfN_}]{.mr-2 .mt-2
.md:mt-0 .badge_badge__WnfZm .capitalize .badge_gray-subtle__bXWN7
.badge_sm__BUqp2 geist-badge="" data-version="v2"}
:::
::::::

------------------------------------------------------------------------

::::::::::: {.section .knowledge-content}
[Vercel for
GitHub](https://vercel.com/docs/deployments/git/vercel-for-github){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}
automatically deploys your GitHub projects with
[Vercel](https://vercel.com/){.link_link__hbWKh .link_highlight__kJZF9
rel="noopener" target="_blank" zone="null"}, providing [Preview
Deployment
URLs](https://vercel.com/docs/concepts/deployments/preview-deployments#preview-urls){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}, and
automatic [Custom
Domain](https://vercel.com/docs/concepts/projects/custom-domains){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}
updates.

For advanced usecase, you can use Vercel with GitHub Actions as your
CI/CD provider to generate Preview Deployments for
every `git`{.code_code__P46Ep style="font-size:0.9em"} push and deploy
to Production when code is merged into the `main`{.code_code__P46Ep
style="font-size:0.9em"} branch.

This approach is useful for developers who want full control over their
CI/CD pipeline, as well as GitHub Enterprise Server users, who can't
leverage Vercel's built-in [git
integration](https://vercel.com/docs/concepts/git/vercel-for-github){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}.

You can [view the completed example
here](https://github.com/vercel/examples/tree/main/ci-cd/github-actions){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"} or
follow this guide to get started.

<div>

## []{#building-your-application .linked-heading_target__xscdv}[Building Your Application](#building-your-application){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#building-your-application .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

You can build your application locally (or in GitHub Actions) without
giving Vercel access to the source code
through `vercel build`{.code_code__P46Ep style="font-size:0.9em"}.
Vercel automatically detects your frontend framework and generates
a `.vercel/output`{.code_code__P46Ep style="font-size:0.9em"} folder
conforming to the [Build Output API
specification](https://vercel.com/docs/build-output-api/v3){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}.

`vercel build`{.code_code__P46Ep style="font-size:0.9em"} allows you to
build your project within your own CI setup, whether it be GitHub
Actions or your own in-house CI, and upload *only* those build artifacts
(and not the source code) to Vercel to create a deployment.

<div>

## []{#configuring-github-actions-for-vercel .linked-heading_target__xscdv}[Configuring GitHub Actions for Vercel](#configuring-github-actions-for-vercel){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#configuring-github-actions-for-vercel .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

`vercel deploy --prebuilt`{.code_code__P46Ep
style="font-size:0.9em"} skips the build step on Vercel and uploads the
previously generated `.vercel/output`{.code_code__P46Ep
style="font-size:0.9em"} folder from the GitHub Action.Let's create our
Action by creating a new
file `.github/workflows/preview.yaml`{.code_code__P46Ep
style="font-size:0.9em"}:

:::: {.renderers_codeWrapper__wBIMG vercel-edit-target="true"}
::: {.relative .code-block_wrapper__t6FCO geist-code-block=""}
![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIuNzUgMC41QzEuNzgzNSAwLjUgMSAxLjI4MzUgMSAyLjI1VjkuNzVDMSAxMC43MTY1IDEuNzgzNSAxMS41IDIuNzUgMTEuNUgzLjc1SDQuNVYxMEgzLjc1SDIuNzVDMi42MTE5MyAxMCAyLjUgOS44ODgwNyAyLjUgOS43NVYyLjI1QzIuNSAyLjExMTkzIDIuNjExOTMgMiAyLjc1IDJIOC4yNUM4LjM4ODA3IDIgOC41IDIuMTExOTMgOC41IDIuMjVWM0gxMFYyLjI1QzEwIDEuMjgzNSA5LjIxNjUgMC41IDguMjUgMC41SDIuNzVaTTcuNzUgNC41QzYuNzgzNSA0LjUgNiA1LjI4MzUgNiA2LjI1VjEzLjc1QzYgMTQuNzE2NSA2Ljc4MzUgMTUuNSA3Ljc1IDE1LjVIMTMuMjVDMTQuMjE2NSAxNS41IDE1IDE0LjcxNjUgMTUgMTMuNzVWNi4yNUMxNSA1LjI4MzUgMTQuMjE2NSA0LjUgMTMuMjUgNC41SDcuNzVaTTcuNSA2LjI1QzcuNSA2LjExMTkzIDcuNjExOTMgNiA3Ljc1IDZIMTMuMjVDMTMuMzg4MSA2IDEzLjUgNi4xMTE5MyAxMy41IDYuMjVWMTMuNzVDMTMuNSAxMy44ODgxIDEzLjM4ODEgMTQgMTMuMjUgMTRINy43NUM3LjYxMTkzIDE0IDcuNSAxMy44ODgxIDcuNSAxMy43NVY2LjI1WiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==)![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjU2MDcgMy45OTk5OUwxNS4wMzAzIDQuNTMwMzJMNi4yMzc0NCAxMy4zMjMyQzUuNTU0MDMgMTQuMDA2NiA0LjQ0NTk5IDE0LjAwNjYgMy43NjI1NyAxMy4zMjMyTDQuMjkyOSAxMi43OTI5TDMuNzYyNTcgMTMuMzIzMkwwLjk2OTY3NiAxMC41MzAzTDAuNDM5MzQ2IDkuOTk5OTlMMS41MDAwMSA4LjkzOTMzTDIuMDMwMzQgOS40Njk2Nkw0LjgyMzIzIDEyLjI2MjZDNC45MjA4NiAxMi4zNjAyIDUuMDc5MTUgMTIuMzYwMiA1LjE3Njc4IDEyLjI2MjZMMTMuOTY5NyAzLjQ2OTY2TDE0LjUgMi45MzkzM0wxNS41NjA3IDMuOTk5OTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+PC9zdmc+)

``` {.prism-code .language-text .code-block_pre___OLfy}
name: Vercel Preview Deploymentenv:  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}on:  push:    branches-ignore:      - mainjobs:  Deploy-Preview:    runs-on: ubuntu-latest    steps:      - uses: actions/checkout@v2      - name: Install Vercel CLI        run: npm install --global vercel@latest      - name: Pull Vercel Environment Information        run: vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}      - name: Build Project Artifacts        run: vercel build --token=${{ secrets.VERCEL_TOKEN }}      - name: Deploy Project Artifacts to Vercel        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
```
:::

A GitHub Action to create a Vercel Preview Deployment
::::

This Action will run when your code is pushed to a git branch. Let's do
the same for Production environments with a separate Action:

:::: {.renderers_codeWrapper__wBIMG vercel-edit-target="true"}
::: {.relative .code-block_wrapper__t6FCO geist-code-block=""}
![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIuNzUgMC41QzEuNzgzNSAwLjUgMSAxLjI4MzUgMSAyLjI1VjkuNzVDMSAxMC43MTY1IDEuNzgzNSAxMS41IDIuNzUgMTEuNUgzLjc1SDQuNVYxMEgzLjc1SDIuNzVDMi42MTE5MyAxMCAyLjUgOS44ODgwNyAyLjUgOS43NVYyLjI1QzIuNSAyLjExMTkzIDIuNjExOTMgMiAyLjc1IDJIOC4yNUM4LjM4ODA3IDIgOC41IDIuMTExOTMgOC41IDIuMjVWM0gxMFYyLjI1QzEwIDEuMjgzNSA5LjIxNjUgMC41IDguMjUgMC41SDIuNzVaTTcuNzUgNC41QzYuNzgzNSA0LjUgNiA1LjI4MzUgNiA2LjI1VjEzLjc1QzYgMTQuNzE2NSA2Ljc4MzUgMTUuNSA3Ljc1IDE1LjVIMTMuMjVDMTQuMjE2NSAxNS41IDE1IDE0LjcxNjUgMTUgMTMuNzVWNi4yNUMxNSA1LjI4MzUgMTQuMjE2NSA0LjUgMTMuMjUgNC41SDcuNzVaTTcuNSA2LjI1QzcuNSA2LjExMTkzIDcuNjExOTMgNiA3Ljc1IDZIMTMuMjVDMTMuMzg4MSA2IDEzLjUgNi4xMTE5MyAxMy41IDYuMjVWMTMuNzVDMTMuNSAxMy44ODgxIDEzLjM4ODEgMTQgMTMuMjUgMTRINy43NUM3LjYxMTkzIDE0IDcuNSAxMy44ODgxIDcuNSAxMy43NVY2LjI1WiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==)![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjU2MDcgMy45OTk5OUwxNS4wMzAzIDQuNTMwMzJMNi4yMzc0NCAxMy4zMjMyQzUuNTU0MDMgMTQuMDA2NiA0LjQ0NTk5IDE0LjAwNjYgMy43NjI1NyAxMy4zMjMyTDQuMjkyOSAxMi43OTI5TDMuNzYyNTcgMTMuMzIzMkwwLjk2OTY3NiAxMC41MzAzTDAuNDM5MzQ2IDkuOTk5OTlMMS41MDAwMSA4LjkzOTMzTDIuMDMwMzQgOS40Njk2Nkw0LjgyMzIzIDEyLjI2MjZDNC45MjA4NiAxMi4zNjAyIDUuMDc5MTUgMTIuMzYwMiA1LjE3Njc4IDEyLjI2MjZMMTMuOTY5NyAzLjQ2OTY2TDE0LjUgMi45MzkzM0wxNS41NjA3IDMuOTk5OTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+PC9zdmc+)

``` {.prism-code .language-text .code-block_pre___OLfy}
name: Vercel Production Deploymentenv:  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}on:  push:    branches:      - mainjobs:  Deploy-Production:    runs-on: ubuntu-latest    steps:      - uses: actions/checkout@v2      - name: Install Vercel CLI        run: npm install --global vercel@latest      - name: Pull Vercel Environment Information        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}      - name: Build Project Artifacts        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}      - name: Deploy Project Artifacts to Vercel        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```
:::

A GitHub Action to create a Vercel Production Deployment
::::

Finally, let's add the required values from Vercel as secrets in GitHub:

1.  Retrieve your [Vercel Access
    Token](https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token){.link_link__hbWKh
    .link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}
2.  Install the [Vercel CLI](https://vercel.com/cli){.link_link__hbWKh
    .link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}
    and run `vercel login`{.code_code__P46Ep style="font-size:0.9em"}
3.  Inside your folder, run `vercel link `{.code_code__P46Ep
    style="font-size:0.9em"}to create a new Vercel project
4.  Inside the generated `.vercel `{.code_code__P46Ep
    style="font-size:0.9em"}folder, save the
    `projectId `{.code_code__P46Ep style="font-size:0.9em"}and
    `orgId `{.code_code__P46Ep style="font-size:0.9em"}from the
    `project.json`{.code_code__P46Ep style="font-size:0.9em"}
5.  Inside GitHub, add `VERCEL_TOKEN`{.code_code__P46Ep
    style="font-size:0.9em"}, `VERCEL_ORG_ID`{.code_code__P46Ep
    style="font-size:0.9em"}, and `VERCEL_PROJECT_ID `{.code_code__P46Ep
    style="font-size:0.9em"}as
    [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets){.link_link__hbWKh
    .link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}

<div>

## []{#deploying-your-vercel-application-with-github-actions .linked-heading_target__xscdv}[Deploying Your Vercel Application with GitHub Actions](#deploying-your-vercel-application-with-github-actions){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#deploying-your-vercel-application-with-github-actions .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

Now that your Vercel application is configured with GitHub Actions, you
can try out the workflow:

- Create a new pull request to your GitHub repository
- GitHub Actions will recognize the change and use the Vercel CLI to
  build your application
- The Action uploads the build output to Vercel and creates a Preview
  Deployment
- When the pull request is merged, a Production build is created and
  deployed

Every pull request will now automatically have a Preview Deployment
attached. If the pull request needs to be rolled back, you can revert
and merge the PR and Vercel will start a new Production build back to
the old git state.

<div>

## []{#deploying-to-multiple-projects-using-github-actions .linked-heading_target__xscdv}[Deploying to Multiple Projects Using GitHub Actions](#deploying-to-multiple-projects-using-github-actions){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#deploying-to-multiple-projects-using-github-actions .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

You can deploy to multiple projects by creating multiple project ID
secrets in GitHub and using them in separate workflow
`.yaml`{.code_code__P46Ep style="font-size:0.9em"} files to set up the
environments.

1.  Retrieve and save Vercel project IDs for the projects you\'d like to
    deploy to by following the steps above. For example,
    `VERCEL_PROJECT_ID_1`{.code_code__P46Ep style="font-size:0.9em"},
    `VERCEL_PROJECT_ID_2`{.code_code__P46Ep style="font-size:0.9em"},
    etc. `vercel link`{.code_code__P46Ep style="font-size:0.9em"} will
    prompt you to select a project: you can link to the suggested option
    or a different existing project. This is how you can select
    different projects and retrieve their IDs.
2.  Create a workflow file for each project and reference the project ID
    secret in the `env`{.code_code__P46Ep style="font-size:0.9em"}
    section.
:::::::::::
::::::::::::::::::

:::::: guides_contactWrapper__a6WVf
::::: {.guides_contactcardsm__iHUjn .guides_ImgBackStars__AvyJe}
:::: {.guides_row__PiS9D .guides_rowheight0__buwhx}
::: guides_contactbutton__P0q8M
### Couldn\'t find the guide you need?

[View Help]{.button_content__1aE1_}
:::
::::
:::::
::::::
:::::::::::::::::::::::
::::::::::::::::::::::::
:::::::::::::::::::::::::
