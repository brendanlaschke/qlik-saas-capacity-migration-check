'use client';

import { AppInfo } from '@/app/api/getLargeApps/route';
import { SpaceWithSize } from '@/app/api/getTenantSpaceSize/route';
import {
    Button,
    Flex,
    Input,
    Field,
    Grid,
    Heading,
    Text,
    Table,
    Box,
    Spinner,
} from '@chakra-ui/react';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useState } from 'react';

const showAppsBiggerThan = 1024 * 1000 * 1000 * 5; // 5GB

export const Home = () => {
    const [tenantUrl, setTenantUrl] = useLocalStorage<string>('tenantUrl');
    const [apiKey, setApiKey] = useLocalStorage<string>('apiKey');

    const [spaceData, setSpaceData] = useState<SpaceWithSize[]>([]);
    const [appData, setAppData] = useState<AppInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    async function sendRequest(next?: string) {
        const res = await fetch('/api/getTenantSpaceSize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tenantUrl, apiKey, next }),
        });
        const json = await res.json();

        setSpaceData((old) => [...old, ...json.data.filter((x) => x.size > 0)]);
        setTimeout(() => {
            if (json.next) {
                sendRequest(json.next);
            } else {
                sendAppRequest();
            }
        }, 100);
    }

    async function sendAppRequest(next?: string) {
        const res = await fetch('/api/getLargeApps', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tenantUrl, apiKey, next }),
        });
        const json = await res.json();

        setAppData((old) => [...old, ...json.data]);
        setTimeout(() => {
            if (json.next) {
                sendAppRequest(json.next);
            } else {
                setLoading(false);
            }
        }, 100);
    }

    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    return (
        <Flex
            direction="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            mb={8}
            w="full"
            h="full"
            position="relative"
        >
          {loading &&<div style={{position: 'absolute', left: 0, top: '-38px', transform: 'translate(50%, -50%)'}}>
            <Spinner></Spinner>
          </div>}
            <Grid textAlign="center">
                <Heading as="h1" size="2xl" fontWeight="bold">
                    Qlik Migration Check
                </Heading>

                <Text fontSize="xs">
                    Simple check for Qlik Migration from Saas to Saas Capacity
                </Text>
            </Grid>
            {spaceData.length == 0 && (
                <>
                    <Field.Root>
                        <Field.Label>Email</Field.Label>
                        <Input
                            placeholder="Tenant URL"
                            onChange={(e) => setTenantUrl(e.target.value)}
                            value={tenantUrl}
                        ></Input>
                        <Field.HelperText>
                            TenantUrl like https://mycompany.de.qlikcloud.com
                        </Field.HelperText>
                    </Field.Root>
                    <Field.Root>
                        <Field.Label>Api Key</Field.Label>
                        <Input
                            placeholder="Api Key"
                            onChange={(e) => setApiKey(e.target.value)}
                            value={apiKey}
                        ></Input>
                    </Field.Root>
                    <Button
                        size="sm"
                        onClick={() => {
                            setLoading(true);
                            sendRequest();
                        }}
                    >
                        Get Info
                    </Button>
                </>
            )}
            {spaceData.length > 0 && (
                <>
                    <Heading size="md">Space File Sizes</Heading>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Space</Table.ColumnHeader>
                                <Table.ColumnHeader>
                                    File Count
                                </Table.ColumnHeader>
                                <Table.ColumnHeader>Size</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {spaceData
                                .sort((a, b) => {
                                    return b.size - a.size;
                                })
                                .map((item) => (
                                    <Table.Row key={item.name}>
                                        <Table.Cell>{item.name}</Table.Cell>
                                        <Table.Cell>
                                            {item.files?.length}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {formatBytes(item.size)}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                        </Table.Body>
                    </Table.Root>

                    <Box p={4}>
                        <Text fontSize="xs">
                            Sum:{' '}
                            {formatBytes(
                                spaceData.reduce((a, b) => a + b.size, 0)
                            )}
                        </Text>
                    </Box>

                    <Heading size="md">Large Apps</Heading>
                    <Table.Root size="sm">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>App</Table.ColumnHeader>
                                <Table.ColumnHeader>Memory</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body maxH={30}>
                            {appData
                                .sort((a, b) => {
                                    return b.memorySize - a.memorySize;
                                })
                                .map((item) => (
                                    <Table.Row
                                        key={item.name}
                                        backgroundColor={
                                            item.memorySize > showAppsBiggerThan
                                                ? '#FF806677'
                                                : undefined
                                        }
                                    >
                                        <Table.Cell>{item.name}</Table.Cell>
                                        <Table.Cell>
                                            {formatBytes(item.memorySize)}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                        </Table.Body>
                    </Table.Root>

                    <Box p={4}>
                        <Text fontSize="xs">
                            {appData.length
                                ? 'Count: ' + appData.length
                                : 'No large Apps!'}
                        </Text>
                    </Box>
                </>
            )}
        </Flex>
    );
};
