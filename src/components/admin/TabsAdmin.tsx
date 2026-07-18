'use client'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@/components/Tabs'
import TableProjects from '@/components/admin/projects/TableProjects'
import HomeVideos from '@/components/admin/home/HomeVideos'

const TabsAdmin = () => {
    return (
        <Tabs className={'mt-10'}>
            <TabList
                className={'flex justify-center'}
                aria-label='Tabs'
            >
                <Tab
                    className={'cursor-pointer'}
                    id='home'
                >
                    Home
                </Tab>

                <Tab
                    id='projects'
                    className={'cursor-pointer'}
                >
                    Projects
                </Tab>

                <Tab
                    id='about'
                    className={'cursor-pointer'}
                >
                    About
                </Tab>
            </TabList>

            <TabPanels>
                <TabPanel
                    id='home'
                    className='flex items-center justify-center'
                >
                    <HomeVideos />
                </TabPanel>

                <TabPanel
                    id='projects'
                    className='flex items-center justify-center'
                >
                    <TableProjects />
                </TabPanel>

                <TabPanel
                    id='about'
                    className='flex items-center justify-center'
                >
                    {'🚧 En cours 🚧'}
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default TabsAdmin
