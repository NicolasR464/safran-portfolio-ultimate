'use client'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@/components/Tabs'
import TableProjects from '@/components/admin/projects/TableProjects'

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
                    {'<Home />'}
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
                    {'  <Settings />'}
                </TabPanel>
            </TabPanels>
        </Tabs>
    )
}

export default TabsAdmin
