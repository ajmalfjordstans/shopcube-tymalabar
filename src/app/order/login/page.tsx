import LoginPage from '@/components/order/LoginPage';

export default async function OrderLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <LoginPage next={next} />;
}
