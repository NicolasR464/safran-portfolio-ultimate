'use client'

import Image from 'next/image'
import { Mail, Menu as MenuIcon } from 'lucide-react'

import ButtonGeneric from '@/components/buttons/ButtonGeneric'
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from '@/components/Menu'
import { localLogos } from '@/utils/constants'
import { urls } from '@/utils/constants/urls'
import { handleMailPress } from '@/utils/functions'
import { signOutAction } from '@/utils/functions/auth'

type HeaderBurgerMenuProps = {
    isLoggedIn: boolean
}

const MenuBurger = ({ isLoggedIn }: HeaderBurgerMenuProps) => {
    return (
        <div className='ml-auto flex items-center'>
            <MenuTrigger placement='bottom end'>
                <ButtonGeneric aria-label='Open navigation menu'>
                    <MenuIcon
                        aria-hidden
                        className='h-5 w-5'
                    />
                </ButtonGeneric>

                <Menu
                    aria-label='Navigation'
                    className='min-w-52 p-2'
                >
                    <MenuItem
                        id='portfolio'
                        href='/portfolio'
                        textValue='Portfolio'
                    >
                        Portfolio
                    </MenuItem>

                    <MenuItem
                        id='about'
                        href='/about'
                        textValue='About'
                    >
                        About
                    </MenuItem>

                    <MenuItem
                        id='instagram'
                        href={urls.INSTAGRAM}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        <Image
                            src={localLogos.instagramLogo.SRC}
                            height={24}
                            width={24}
                            alt=''
                            aria-hidden
                        />
                    </MenuItem>

                    {/* Mail */}
                    <MenuItem
                        id='mail'
                        onAction={handleMailPress}
                        rel='noopener noreferrer'
                    >
                        <Mail className='h-7 w-7 text-white' />
                    </MenuItem>

                    {isLoggedIn && (
                        <>
                            <MenuSeparator />

                            <MenuItem
                                id='admin'
                                href={urls.admin.MAIN}
                                textValue='Admin'
                            >
                                Admin
                            </MenuItem>

                            <MenuItem
                                id='logout'
                                textValue='Sign out'
                                onAction={() => {
                                    void signOutAction()
                                }}
                            >
                                Log out
                            </MenuItem>
                        </>
                    )}
                </Menu>
            </MenuTrigger>
        </div>
    )
}

export default MenuBurger
