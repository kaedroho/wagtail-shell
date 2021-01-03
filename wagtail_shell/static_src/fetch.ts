import { HeaderProps } from "./components/Header";
import { Mode } from "./main";

interface ShellResponseLoadIt {
    status: 'load-it';
}

interface ShellResponseRender {
    status: 'render';
    view: string;
    context: any;
    header?: HeaderProps;
}

interface ShellResponseNotFound {
    status: 'not-found';
}

interface ShellResponsePermissionDenied {
    status: 'permission-denied';
}

export type ShellResponse = ShellResponseLoadIt
                          | ShellResponseRender
                          | ShellResponseNotFound
                          | ShellResponsePermissionDenied;

export async function shellFetch(url: string, mode: Mode): Promise<ShellResponse> {
    const response = await fetch(url, { headers: { 'X-Requested-With': 'WagtailShell', 'X-WagtailShell-Mode': mode } });
    if (!response.headers.get('X-WagtailShellStatus')) {
        console.warn("WagtailShell Warning: A non-JSON response was returned from the server. Did you forget to add the 'download' attribute to an '<a>' tag?");
        return {
            status: 'load-it',
        };
    }
    return response.json();
}
