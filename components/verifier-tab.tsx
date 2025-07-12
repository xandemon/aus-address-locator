"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import {
  verifierFormSchema,
  australianStates,
  type VerifierForm,
} from "@/lib/schemas";
import { formatSuburbName, formatStateDisplay } from "@/lib/utils";
import { useLazyQuery } from "@apollo/client";
import { VERIFY_ADDRESS } from "@/lib/graphql/schema";

export function VerifierTab() {
  const { verifierData, updateVerifierData, isVerifying, setIsVerifying } =
    useApp();

  const [formData, setFormData] = useState<VerifierForm>({
    postcode: verifierData.postcode,
    suburb: verifierData.suburb,
    state: (verifierData.state as any) || "NSW",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof VerifierForm, string>>
  >({});

  const [verifyAddressQuery, { loading, data, error }] =
    useLazyQuery(VERIFY_ADDRESS);

  useEffect(() => {
    setFormData({
      postcode: verifierData.postcode,
      suburb: verifierData.suburb,
      state: (verifierData.state as any) || "NSW",
    });
  }, [verifierData]);

  const handleInputChange = (field: keyof VerifierForm, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    updateVerifierData({ [field]: value });
  };

  const validateForm = (): boolean => {
    try {
      verifierFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<Record<keyof VerifierForm, string>> = {};

      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof VerifierForm;
          fieldErrors[field] = err.message;
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsVerifying(true);

    try {
      const result = await verifyAddressQuery({
        variables: {
          input: {
            postcode: formData.postcode,
            suburb: formData.suburb,
            state: formData.state,
          },
        },
      });

      if (result.data?.verifyAddress) {
        updateVerifierData({ lastResult: result.data.verifyAddress });
      } else {
        throw new Error("No data returned from GraphQL query");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      updateVerifierData({
        lastResult: {
          isValid: false,
          message: "Failed to verify address. Please try again.",
        },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const stateOptions = australianStates.map((state) => ({
    value: state,
    label: `${state} - ${formatStateDisplay(state)}`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Address Verifier
        </h2>
        <p className="text-gray-600">
          Verify that your postcode, suburb, and state combination is valid
          according to Australia Post data.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Postcode"
            placeholder="e.g., 2000"
            value={formData.postcode}
            onChange={(e) => handleInputChange("postcode", e.target.value)}
            error={!!errors.postcode}
            errorMessage={errors.postcode}
            maxLength={4}
          />

          <Input
            label="Suburb"
            placeholder="e.g., Sydney"
            value={formData.suburb}
            onChange={(e) => handleInputChange("suburb", e.target.value)}
            error={!!errors.suburb}
            errorMessage={errors.suburb}
          />
        </div>

        <Select
          label="State/Territory"
          value={formData.state}
          onChange={(e) => handleInputChange("state", e.target.value)}
          options={stateOptions}
          error={!!errors.state}
          errorMessage={errors.state}
        />

        <Button
          type="submit"
          isLoading={isVerifying}
          className="w-full md:w-auto"
        >
          {isVerifying ? "Verifying..." : "Verify Address"}
        </Button>
      </form>

      {verifierData.lastResult && (
        <Alert
          variant={verifierData.lastResult.isValid ? "success" : "error"}
          title={
            verifierData.lastResult.isValid
              ? "Valid Address"
              : "Invalid Address"
          }
        >
          {verifierData.lastResult.message}
        </Alert>
      )}

      {/* TODO: Add Google Maps component here */}
      {verifierData.lastResult?.isValid && verifierData.lastResult.location && (
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Location Preview</h3>
          <p className="text-gray-600">
            {formatSuburbName(verifierData.lastResult.location.location)},{" "}
            {verifierData.lastResult.location.state}{" "}
            {verifierData.lastResult.location.postcode}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Google Maps integration coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
