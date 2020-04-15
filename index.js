/**
 * 
 * Name: Neuton Foo
 * School: The University of Southern California
 * Position: Cloudflare Workers Internship Application (Full-Stack)
 * Description: Cloudflare Worker that randomly loads 1 of 2 websites
 * 
 * Watched these videos to better understand Promises, Await and Fetch:
 * https://www.youtube.com/watch?v=DHvZLI7Db8E
 * https://www.youtube.com/watch?v=V_Kr9OSfDeU
 * https://www.youtube.com/watch?v=cuEtnrL9-H0
 * 
 */

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */

const API_VARIANTS = 'https://cfw-takehome.developers.workers.dev/api/variants'

async function handleRequest(request) {

    let randomVariantIndex
    const variantIndexCookie = getCookie(request, "variantIndex")
    if (variantIndexCookie) {
        randomVariantIndex = variantIndexCookie
    } else {
        randomVariantIndex = Math.round(Math.random())
    }

    try {
        const variantsResponse = await fetch(API_VARIANTS)

        if (variantsResponse.ok) {
            const variantsData = await variantsResponse.json()
            const randomVariant = variantsData.variants[randomVariantIndex]

            const variantResponse = await fetch(randomVariant)

            if (variantResponse.ok) {
                // return new Response(newResponse.body)

                let newResponse = new HTMLRewriter().on('*', new VariantRewriterHandler()).transform(variantResponse)
                newResponse.headers.append('Set-Cookie', `variantIndex=${randomVariantIndex}; path=/`)

                return newResponse;
            }
        }
    } catch (error) {
        return new Response(error)
    }

    return new Response("Default / Error")
}

class VariantRewriterHandler {
    element(element) {

        if (element.tagName == "title") {
            element.prepend("Rewritten ")
            element.append(" Title")
        } else if (element.tagName == "h1" && element.getAttribute("id") == "title") {
            element.prepend("Restyled ")
            element.append(" Heading")
            element.setAttribute("class", "uppercase tracking-wide text-sm text-indigo-600 font-bold")

        } else if (element.tagName == "p" && element.getAttribute("id") == "description") {
            element.setInnerContent("Visit my website")
        } else if (element.tagName == "a" && element.getAttribute("id") == "url") {
            element.setAttribute("href", "http://neutonfoo.com")
            element.setInnerContent("Go to neutonfoo.com")
        }
    }

    comments(comment) {
        // An incoming comment
    }

    text(text) {
        // An incoming piece of text
    }
}

// From https://developers.cloudflare.com/workers/templates/pages/cookie_extract/

/**
 * Grabs the cookie with name from the request headers
 * @param {Request} request incoming Request
 * @param {string} name of the cookie to grab
 */
function getCookie(request, name) {
    let result = null
    let cookieString = request.headers.get('Cookie')
    if (cookieString) {
        let cookies = cookieString.split(';')
        cookies.forEach(cookie => {
            let cookieName = cookie.split('=')[0].trim()
            if (cookieName === name) {
                let cookieVal = cookie.split('=')[1]
                result = cookieVal
            }
        })
    }
    return result
}