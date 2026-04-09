import { redirect } from 'next/navigation';

/** 旧「介绍」独立路由；书签与外链仍可能指向此处。 */
export default function IntroRedirectPage() {
  redirect('/');
}
