import { redirect } from 'next/navigation';

export default function Home() {
  // Ana dizine gelen istekleri /tr'ye yönlendir
  redirect('/tr');
}
