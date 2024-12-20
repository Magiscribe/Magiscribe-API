export default `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">

<head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>{{title}}</title>
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }
    </style>
    <style>
        .text-gray {
            color: #4b5563;
        }

        .text-dark {
            color: #0f172a;
        }

        a {
            color: #818cf8 !important;
            text-decoration: none !important;
        }

        @media (max-width: 600px) {
            .sm-w-full {
                width: 100% !important;
            }

            .sm-py-32 {
                padding-top: 32px !important;
                padding-bottom: 32px !important;
            }

            .sm-px-24 {
                padding-left: 24px !important;
                padding-right: 24px !important;
            }

            .sm-leading-32 {
                line-height: 32px !important;
            }
        }

        @media (prefers-color-scheme: dark) {
            .text-gray {
                color: #a9a9a9 !important;
            }

            .text-dark {
                color: #ffffff !important;
            }
        }
    </style>
</head>

<body style="margin: 0; width: 100%; padding: 0; word-break: break-word; -webkit-font-smoothing: antialiased;">
    <div style="display: none;">
        {{preview}}
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
        &#847; &#847; &#847; &#847; &#847; &#847; &#847;&#847; &#847; &#847;
    </div>
    <div role="article" aria-roledescription="email" aria-label="{{title}}" lang="en">
        <table class="sm-w-full" align="center" style="width: 600px;" cellpadding="0" cellspacing="0"
            role="presentation">
            <tr>
                <td class="sm-py-32 sm-px-24" style="padding: 48px; text-align: center;">
                    <!-- <a href="https://ohmysmtp.com">
                        <img src="https://docs.ohmysmtp.com/img/logo.png" width="75" alt="Your Logo"
                            style="max-width: 100%; vertical-align: middle; line-height: 100%; border: 0;">
                    </a> -->
                </td>
            </tr>
        </table>
        <table style="width: 100%; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;"
            cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center">
                    <table class="sm-w-full" style="width: 600px;" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                            <td align="center" class="sm-px-24">
                                <table style="width: 100%;" cellpadding="0" cellspacing="0" role="presentation">
                                    <tr>
                                        <td class="text-gray sm-px-24"
                                            style="padding-left: 48px; padding-right: 48px; padding-top: 48px; padding-bottom: 8px; text-align: left; font-size: 16px; line-height: 24px; color: #1f2937; border-radius: 1rem;">
                                            <p class="sm-leading-32 text-dark"
                                                style="margin: 0; margin-bottom: 36px; font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 24px; font-weight: 600; color: #000000;">
                                                {{title}}
                                            </p>
                                            {{content}}
                                            <table style="width: 100%;" cellpadding="0" cellspacing="0"
                                                role="presentation">
                                                <tr>
                                                    <td style="padding-top: 16px; padding-bottom: 16px;">
                                                        <hr style="border-bottom-width: 0px; border-color: #f3f4f6;">
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="font-size: 12px;">
                                                        <a class="link" href="{{baseURL}}">Magiscribe</a> |
                                                        <a class="link" href="{{baseURL}}/terms">Terms of
                                                            Use</a> |
                                                        <a class="link" href="{{baseURL}}/privacy">Privacy
                                                            Policy</a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>

`;
