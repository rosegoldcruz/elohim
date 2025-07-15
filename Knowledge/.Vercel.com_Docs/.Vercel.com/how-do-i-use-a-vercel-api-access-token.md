:::::::::::::::::::::::::: {.border-solid .border-b .border-0 .border-[var(--ds-gray-alpha-400)] .mb-[90px] role="main"}
::::::::::::::::::::::::: guides_backgroundColor__i2q6n
:::::::::::::::::::::::: guides_containerGuidePage__dP5z8
::::::::::::::::::: guides_childContainer__t7lik
::: h-[48px]
[[← Back to Guides]{.small}](/guides){.link_link__hbWKh
.link_secondary__F1rqx zone="same"}
:::

::: {.linked-heading_hasDescription__CyYiJ .linked-heading_container__iwdxj}
# []{#how-do-i-use-a-vercel-api-access-token .linked-heading_target__xscdv .linked-heading_offsetTop__uAoyO}[How do I use a Vercel API Access Token?]{.linked-heading_title__mCMLh .[&>p]:m-0} {#how-do-i-use-a-vercel-api-access-token .text_wrapper__i87JK .linked-heading_header__YpMmf .headings_heading__DRlSP data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2.5rem;--text-line-height:3.5rem;--text-letter-spacing:-0.058125rem;--text-weight:600" components-heading="true"}

[An Access Token is required in order to use the Vercel API. Tokens can
be created and managed at the level of your
account.]{.linked-heading_description__ijcxY}
:::

:::::: {.flex .flex-col .md:flex-row .mt-10 .md:items-center .justify-between}
:::: lastupdated_lastUpdatedSection__h385Y
::: lastupdated_lastUpdatedText__K8mlx
Last updated on March 15, 2023
:::
::::

::: {.flex .flex-wrap .items-center .md:mt-0 .mt-2}
[[API & CLI]{.badge_contentContainer__khfN_}]{.mr-2 .mt-2 .md:mt-0
.badge_badge__WnfZm .capitalize .badge_gray-subtle__bXWN7
.badge_sm__BUqp2 geist-badge="" data-version="v2"}
:::
::::::

------------------------------------------------------------------------

:::::::::::: {.section .knowledge-content}
[Vercel Access
Tokens](https://vercel.com/docs/rest-api#introduction/api-basics/authentication){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"} are
required to authenticate and use the [Vercel
API](https://vercel.com/docs/api){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}.

Tokens can be created and managed inside your account settings, and can
be scoped to only allow access for specific Teams. This article covers
how to create a token and use it with your account.

<div>

## []{#creating-an-access-token .linked-heading_target__xscdv}[Creating an Access Token](#creating-an-access-token){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#creating-an-access-token .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

Make sure that you are under **Personal Account** and not **Teams** in
the dropdown at the top left in the Navigation bar. Navigate to
the [Account Tokens
page](https://vercel.com/account/tokens){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}, also
found under the **Settings** area of your Personal Account.

1.  Click **Create** to open the create token modal.
2.  Enter a descriptive name and click **Create Token**.
3.  Choose the scope of access for the token from the dropdown.
4.  Make a note of the token created as it will **not be shown again**.

<div>

## []{#using-the-access-token-in-personal-account-api-calls .linked-heading_target__xscdv}[Using the Access Token in Personal Account API Calls](#using-the-access-token-in-personal-account-api-calls){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#using-the-access-token-in-personal-account-api-calls .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

Once your [token has been
created](https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token#how-to-create-the-token){.link_link__hbWKh
.link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}, you
can use it with the Vercel API. For example:

1.  Identify the [Vercel API
    endpoint](https://vercel.com/docs/api){.link_link__hbWKh
    .link_highlight__kJZF9 rel="noopener" target="_blank" zone="null"}
    you would like to call. For example, to list the deployments in your
    Personal Account, the endpoint is
    `/v6/deployments`{.code_code__P46Ep style="font-size:0.9em"}. The
    access token token you created would need access to your Personal
    Account.
2.  Make a request to
    `https://api.vercel.com/v6/deployments`{.code_code__P46Ep
    style="font-size:0.9em"} using your access token as the
    Authorization header.

:::: {.renderers_codeWrapper__wBIMG vercel-edit-target="true"}
::: {.relative .code-block_wrapper__t6FCO geist-code-block=""}
![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIuNzUgMC41QzEuNzgzNSAwLjUgMSAxLjI4MzUgMSAyLjI1VjkuNzVDMSAxMC43MTY1IDEuNzgzNSAxMS41IDIuNzUgMTEuNUgzLjc1SDQuNVYxMEgzLjc1SDIuNzVDMi42MTE5MyAxMCAyLjUgOS44ODgwNyAyLjUgOS43NVYyLjI1QzIuNSAyLjExMTkzIDIuNjExOTMgMiAyLjc1IDJIOC4yNUM4LjM4ODA3IDIgOC41IDIuMTExOTMgOC41IDIuMjVWM0gxMFYyLjI1QzEwIDEuMjgzNSA5LjIxNjUgMC41IDguMjUgMC41SDIuNzVaTTcuNzUgNC41QzYuNzgzNSA0LjUgNiA1LjI4MzUgNiA2LjI1VjEzLjc1QzYgMTQuNzE2NSA2Ljc4MzUgMTUuNSA3Ljc1IDE1LjVIMTMuMjVDMTQuMjE2NSAxNS41IDE1IDE0LjcxNjUgMTUgMTMuNzVWNi4yNUMxNSA1LjI4MzUgMTQuMjE2NSA0LjUgMTMuMjUgNC41SDcuNzVaTTcuNSA2LjI1QzcuNSA2LjExMTkzIDcuNjExOTMgNiA3Ljc1IDZIMTMuMjVDMTMuMzg4MSA2IDEzLjUgNi4xMTE5MyAxMy41IDYuMjVWMTMuNzVDMTMuNSAxMy44ODgxIDEzLjM4ODEgMTQgMTMuMjUgMTRINy43NUM3LjYxMTkzIDE0IDcuNSAxMy44ODgxIDcuNSAxMy43NVY2LjI1WiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==)![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjU2MDcgMy45OTk5OUwxNS4wMzAzIDQuNTMwMzJMNi4yMzc0NCAxMy4zMjMyQzUuNTU0MDMgMTQuMDA2NiA0LjQ0NTk5IDE0LjAwNjYgMy43NjI1NyAxMy4zMjMyTDQuMjkyOSAxMi43OTI5TDMuNzYyNTcgMTMuMzIzMkwwLjk2OTY3NiAxMC41MzAzTDAuNDM5MzQ2IDkuOTk5OTlMMS41MDAwMSA4LjkzOTMzTDIuMDMwMzQgOS40Njk2Nkw0LjgyMzIzIDEyLjI2MjZDNC45MjA4NiAxMi4zNjAyIDUuMDc5MTUgMTIuMzYwMiA1LjE3Njc4IDEyLjI2MjZMMTMuOTY5NyAzLjQ2OTY2TDE0LjUgMi45MzkzM0wxNS41NjA3IDMuOTk5OTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+PC9zdmc+)

``` {.prism-code .language-bash .code-block_pre___OLfy}
curl"https://api.vercel.com/v6/deployments" -H "Authorization: Bearer TOKEN"
```
:::

Request to list the deployments of your Personal Account using curl.
::::

:::: {.renderers_codeWrapper__wBIMG vercel-edit-target="true"}
::: {.relative .code-block_wrapper__t6FCO geist-code-block=""}
![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIuNzUgMC41QzEuNzgzNSAwLjUgMSAxLjI4MzUgMSAyLjI1VjkuNzVDMSAxMC43MTY1IDEuNzgzNSAxMS41IDIuNzUgMTEuNUgzLjc1SDQuNVYxMEgzLjc1SDIuNzVDMi42MTE5MyAxMCAyLjUgOS44ODgwNyAyLjUgOS43NVYyLjI1QzIuNSAyLjExMTkzIDIuNjExOTMgMiAyLjc1IDJIOC4yNUM4LjM4ODA3IDIgOC41IDIuMTExOTMgOC41IDIuMjVWM0gxMFYyLjI1QzEwIDEuMjgzNSA5LjIxNjUgMC41IDguMjUgMC41SDIuNzVaTTcuNzUgNC41QzYuNzgzNSA0LjUgNiA1LjI4MzUgNiA2LjI1VjEzLjc1QzYgMTQuNzE2NSA2Ljc4MzUgMTUuNSA3Ljc1IDE1LjVIMTMuMjVDMTQuMjE2NSAxNS41IDE1IDE0LjcxNjUgMTUgMTMuNzVWNi4yNUMxNSA1LjI4MzUgMTQuMjE2NSA0LjUgMTMuMjUgNC41SDcuNzVaTTcuNSA2LjI1QzcuNSA2LjExMTkzIDcuNjExOTMgNiA3Ljc1IDZIMTMuMjVDMTMuMzg4MSA2IDEzLjUgNi4xMTE5MyAxMy41IDYuMjVWMTMuNzVDMTMuNSAxMy44ODgxIDEzLjM4ODEgMTQgMTMuMjUgMTRINy43NUM3LjYxMTkzIDE0IDcuNSAxMy44ODgxIDcuNSAxMy43NVY2LjI1WiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==)![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjU2MDcgMy45OTk5OUwxNS4wMzAzIDQuNTMwMzJMNi4yMzc0NCAxMy4zMjMyQzUuNTU0MDMgMTQuMDA2NiA0LjQ0NTk5IDE0LjAwNjYgMy43NjI1NyAxMy4zMjMyTDQuMjkyOSAxMi43OTI5TDMuNzYyNTcgMTMuMzIzMkwwLjk2OTY3NiAxMC41MzAzTDAuNDM5MzQ2IDkuOTk5OTlMMS41MDAwMSA4LjkzOTMzTDIuMDMwMzQgOS40Njk2Nkw0LjgyMzIzIDEyLjI2MjZDNC45MjA4NiAxMi4zNjAyIDUuMDc5MTUgMTIuMzYwMiA1LjE3Njc4IDEyLjI2MjZMMTMuOTY5NyAzLjQ2OTY2TDE0LjUgMi45MzkzM0wxNS41NjA3IDMuOTk5OTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+PC9zdmc+)

``` {.prism-code .language-javascript .code-block_pre___OLfy}
const result = await fetch(    'https://api.vercel.com/v6/deployments',    {        method: 'GET',        headers: {            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,        }    });
```
:::

Request to list the deployments in your Personal Account.
::::

<div>

## []{#using-the-access-token-in-team-api-calls .linked-heading_target__xscdv}[Using the Access Token in Team API Calls](#using-the-access-token-in-team-api-calls){.linked-heading_title__mCMLh .[&>p]:m-0}[![](data:image/svg+xml;base64,PHN2ZyBjbGFzcz0idGV4dC1bMC42ZW1dIiBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNOC40Njk2OCAxLjQ2OTY4QzEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgLTAuMjAzOTIzIDE0LjUzMDMgMS40Njk2OEMxNi4yMDM5IDMuMTQzMjkgMTYuMjAzOSA1Ljg1Njc0IDE0LjUzMDMgNy41MzAzNEwxMi4wMzAzIDEwLjAzMDNMMTAuOTY5NyA4Ljk2OTY4TDEzLjQ2OTcgNi40Njk2OEMxNC41NTc1IDUuMzgxODYgMTQuNTU3NSAzLjYxODE2IDEzLjQ2OTcgMi41MzAzNEMxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAxLjQ0MjUyIDkuNTMwMzQgMi41MzAzNEw3LjAzMDM0IDUuMDMwMzRMNS45Njk2OCAzLjk2OTY4TDguNDY5NjggMS40Njk2OFpNMTEuNTMwMyA1LjUzMDM0TDUuNTMwMzQgMTEuNTMwM0w0LjQ2OTY4IDEwLjQ2OTdMMTAuNDY5NyA0LjQ2OTY4TDExLjUzMDMgNS41MzAzNFpNMS40Njk2OCAxNC41MzAzQzMuMTQzMjkgMTYuMjAzOSA1Ljg1NjczIDE2LjIwNCA3LjUzMDM0IDE0LjUzMDNMMTAuMDMwMyAxMi4wMzAzTDguOTY5NjggMTAuOTY5N0w2LjQ2OTY4IDEzLjQ2OTdDNS4zODE4NiAxNC41NTc1IDMuNjE4MTYgMTQuNTU3NSAyLjUzMDM0IDEzLjQ2OTdDMS40NDI1MiAxMi4zODE5IDEuNDQyNTIgMTAuNjE4MiAyLjUzMDM0IDkuNTMwMzRMNS4wMzAzNCA3LjAzMDM0TDMuOTY5NjggNS45Njk2OEwxLjQ2OTY4IDguNDY5NjhDLTAuMjAzOTIzIDEwLjE0MzMgLTAuMjAzOTI1IDEyLjg1NjcgMS40Njk2OCAxNC41MzAzWiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==){.text-[0.6em]}]{.linked-heading_permalink__pJ_q_} {#using-the-access-token-in-team-api-calls .text_wrapper__i87JK .linked-heading_header__YpMmf .renderers_heading2__9zxb_ data-version="v1" style="--text-color:var(--ds-gray-1000);--text-size:2rem;--text-line-height:2.5rem;--text-letter-spacing:-0.049375rem;--text-weight:600" components-heading="true"}

</div>

If you are trying to retrieve deployments for a team, you will need to
append `?teamId=<your-team-id>`{.code_code__P46Ep
style="font-size:0.9em"} to the URL. Your Team ID can be found inside
your team\'s general project settings on the dashboard.

You will also need to ensure the access token created has the correct
scope for the Team.

:::: {.renderers_codeWrapper__wBIMG vercel-edit-target="true"}
::: {.relative .code-block_wrapper__t6FCO geist-code-block=""}
![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTIuNzUgMC41QzEuNzgzNSAwLjUgMSAxLjI4MzUgMSAyLjI1VjkuNzVDMSAxMC43MTY1IDEuNzgzNSAxMS41IDIuNzUgMTEuNUgzLjc1SDQuNVYxMEgzLjc1SDIuNzVDMi42MTE5MyAxMCAyLjUgOS44ODgwNyAyLjUgOS43NVYyLjI1QzIuNSAyLjExMTkzIDIuNjExOTMgMiAyLjc1IDJIOC4yNUM4LjM4ODA3IDIgOC41IDIuMTExOTMgOC41IDIuMjVWM0gxMFYyLjI1QzEwIDEuMjgzNSA5LjIxNjUgMC41IDguMjUgMC41SDIuNzVaTTcuNzUgNC41QzYuNzgzNSA0LjUgNiA1LjI4MzUgNiA2LjI1VjEzLjc1QzYgMTQuNzE2NSA2Ljc4MzUgMTUuNSA3Ljc1IDE1LjVIMTMuMjVDMTQuMjE2NSAxNS41IDE1IDE0LjcxNjUgMTUgMTMuNzVWNi4yNUMxNSA1LjI4MzUgMTQuMjE2NSA0LjUgMTMuMjUgNC41SDcuNzVaTTcuNSA2LjI1QzcuNSA2LjExMTkzIDcuNjExOTMgNiA3Ljc1IDZIMTMuMjVDMTMuMzg4MSA2IDEzLjUgNi4xMTE5MyAxMy41IDYuMjVWMTMuNzVDMTMuNSAxMy44ODgxIDEzLjM4ODEgMTQgMTMuMjUgMTRINy43NUM3LjYxMTkzIDE0IDcuNSAxMy44ODgxIDcuNSAxMy43NVY2LjI1WiIgZmlsbD0iY3VycmVudENvbG9yIiAvPjwvc3ZnPg==)![](data:image/svg+xml;base64,PHN2ZyBkYXRhLXRlc3RpZD0iZ2Vpc3QtaWNvbiIgaGVpZ2h0PSIxNiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3R5bGU9ImNvbG9yOmN1cnJlbnRDb2xvciIgdmlld2JveD0iMCAwIDE2IDE2IiB3aWR0aD0iMTYiIGFyaWEtaGlkZGVuPSJ0cnVlIj48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTE1LjU2MDcgMy45OTk5OUwxNS4wMzAzIDQuNTMwMzJMNi4yMzc0NCAxMy4zMjMyQzUuNTU0MDMgMTQuMDA2NiA0LjQ0NTk5IDE0LjAwNjYgMy43NjI1NyAxMy4zMjMyTDQuMjkyOSAxMi43OTI5TDMuNzYyNTcgMTMuMzIzMkwwLjk2OTY3NiAxMC41MzAzTDAuNDM5MzQ2IDkuOTk5OTlMMS41MDAwMSA4LjkzOTMzTDIuMDMwMzQgOS40Njk2Nkw0LjgyMzIzIDEyLjI2MjZDNC45MjA4NiAxMi4zNjAyIDUuMDc5MTUgMTIuMzYwMiA1LjE3Njc4IDEyLjI2MjZMMTMuOTY5NyAzLjQ2OTY2TDE0LjUgMi45MzkzM0wxNS41NjA3IDMuOTk5OTlaIiBmaWxsPSJjdXJyZW50Q29sb3IiIC8+PC9zdmc+)

``` {.prism-code .language-javascript .code-block_pre___OLfy}
const teamId = 'replace-me'const result = await fetch(    `https://api.vercel.com/v6/deployments?teamId=${teamId}`,    {        method: 'GET',        headers: {            Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,        }    });
```
:::

Request to list the deployments in your Team.
::::
::::::::::::
:::::::::::::::::::

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
::::::::::::::::::::::::
:::::::::::::::::::::::::
::::::::::::::::::::::::::
