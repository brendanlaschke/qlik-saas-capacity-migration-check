import { Connection } from '../getTenantSpaceSize/route';

export type AppInfo = {
    name: string;
    memorySize: number;
};

const showAppsBiggerThan = 1024 * 1000 * 1000 * 3; // 3GB

export async function POST(request: Request) {
    try {
        const con: Connection = await request.json();

        if (!con.tenantUrl || !con.apiKey) {
            return new Response('Missing tenantUrl or apiKey', { status: 400 });
        }

        let next =
            con.next ??
            con.tenantUrl + '/api/v1/items?resourceType=app&limit=100';
        const res = await fetch(next, {
            headers: {
                Authorization: `Bearer ${con.apiKey}`,
            },
        });
        const json = await res.json();
        next = json.links?.next?.href;

        const newapps = json.data.filter(
            (app) => app.size > showAppsBiggerThan
        );

        return Response.json({
            data: newapps.map((app) => ({
                name: app.name,
                memorySize: app.resourceSize.appMemory,
            })) as AppInfo[],
            next,
        });
    } catch (err) {
        console.error(err);
        return new Response('Failed to get Info', { status: 500 });
    }
}
