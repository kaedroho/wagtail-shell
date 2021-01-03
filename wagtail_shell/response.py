from bs4 import BeautifulSoup

from django.http import JsonResponse
from django.shortcuts import render

from .ui import Header


class ShellResponse(JsonResponse):
    status = None

    def __init__(self, *args, **kwargs):
        data = {
            'status': self.status,
        }
        data.update(self.get_data(*args, **kwargs))
        super().__init__(data)
        self['X-WagtailShellStatus'] = self.status

    def get_data(self):
        return {}


class ShellResponseLoadIt(ShellResponse):
    status = 'load-it'


class ShellResponseRender(ShellResponse):
    status = 'render'

    def get_data(self, view, context, header=None):
        return {
            'view': view,
            'context': context,
            'header': header.as_json() if header else None,
        }


class ShellResponseRenderHtml(ShellResponseRender):
    def get_data(self, html):
        # HACK: Extract legacy header from HTML
        soup = BeautifulSoup(html, 'html.parser')
        header = Header.extract_from_legacy_html(soup)

        if header:
            return super().get_data('iframe', {
                'html': str(soup),
            }, header=header)
        else:
            return super().get_data('iframe', {'html': html})


class ShellResponseNotFound(ShellResponse):
    status = 'not-found'


class ShellResponsePermissionDenied(ShellResponse):
    status = 'permission-denied'


def convert_to_shell_response(request, response):
    """
    Converts a non-shell response into a shell one.
    """
    # If the response is HTML and isn't the login view then return a "render HTML
    # response that wraps the response in an iframe on the frontend

    # FIXME: Find a proper mime type parser
    is_html = response.get('Content-Type').startswith('text/html')
    if is_html:
        if hasattr(response, 'render'):
            response.render()

        if getattr(request, 'wagtailshell_template_enabled', False):
            return ShellResponseRenderHtml(response.content.decode('utf-8'))

    # Can't convert the response
    return response
