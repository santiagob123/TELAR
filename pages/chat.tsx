import { GetServerSideProps } from 'next'

export default function PublicChatRedirect() {
  return null
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/',
    permanent: false
  }
})