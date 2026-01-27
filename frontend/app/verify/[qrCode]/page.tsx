interface VerifyPageProps {
  params: {
    qrCode: string;
  };
}

export default function VerifyPage({ params }: VerifyPageProps) {
  return (
    <div>
      <h1>QR Code Verification</h1>
      <p>QR Code: {params.qrCode}</p>
    </div>
  );
}

