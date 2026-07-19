'use client'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@/components/Tabs'
import TableProjects from '@/components/admin/projects/TableProjects'
import HomeVideos from '@/components/admin/home/HomeVideos'

const TabsAdmin = () => {
    return (
        <Tabs className={'mt-4'}>
            <div className='sticky top-[var(--header-height)] z-20 flex justify-center py-3'>
                <TabList
                    className={
                        'border border-neutral-700 p-4 rounded-full bg-black/60 backdrop-blur-sm'
                    }
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
            </div>

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
