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
import { logInteraction } from "@/lib/session";
import {
  Shield,
  MapPin,
  CheckCircle,
  Clock,
  Building2,
  Map,
  AlertTriangle,
  Zap,
} from "lucide-react";

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
        const verificationResult = result.data.verifyAddress;
        updateVerifierData({ lastResult: verificationResult });

        if (verificationResult.isValid) {
          await logInteraction("verifier", {
            input: {
              postcode: formData.postcode,
              suburb: formData.suburb,
              state: formData.state,
            },
            result: verificationResult,
          });
        }
      } else {
        throw new Error("No data returned from GraphQL query");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      const errorResult = {
        isValid: false,
        message: "Failed to verify address. Please try again.",
      };
      updateVerifierData({ lastResult: errorResult });
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Address Details
            </h3>
            <p className="text-sm text-slate-500">
              Enter the address information to verify
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Input
              label="Suburb"
              placeholder="Enter suburb name"
              value={formData.suburb}
              onChange={(e) => handleInputChange("suburb", e.target.value)}
              error={!!errors.suburb}
              errorMessage={errors.suburb}
              hint="e.g., Sydney, Melbourne, Brisbane"
            />

            <Input
              label="Postcode"
              placeholder="Enter 4-digit postcode"
              value={formData.postcode}
              onChange={(e) => handleInputChange("postcode", e.target.value)}
              error={!!errors.postcode}
              errorMessage={errors.postcode}
              maxLength={4}
              hint="Australian postcode (4 digits)"
            />
          </div>

          <Select
            label="State/Territory"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            options={stateOptions}
            error={!!errors.state}
            errorMessage={errors.state}
            hint="Select the Australian state or territory"
          />
          {verifierData.lastResult && (
            <div
              className={`border rounded-xl p-5 ${
                verifierData.lastResult.isValid
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${
                    verifierData.lastResult.isValid
                      ? "bg-emerald-100"
                      : "bg-red-100"
                  }`}
                >
                  {verifierData.lastResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <h3
                      className={`text-base font-medium ${
                        verifierData.lastResult.isValid
                          ? "text-emerald-900"
                          : "text-red-900"
                      }`}
                    >
                      {verifierData.lastResult.isValid
                        ? "Address Verified"
                        : "Verification Failed"}
                    </h3>
                  </div>
                  <p
                    className={`${
                      verifierData.lastResult.isValid
                        ? "text-emerald-700"
                        : "text-red-700"
                    } text-sm`}
                  >
                    {verifierData.lastResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              type="submit"
              isLoading={isVerifying}
              size="lg"
              className="px-8 h-[50px]"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isVerifying ? "Verifying Address..." : "Verify Address"}
            </Button>
          </div>
        </form>
      </div>

      {verifierData.lastResult && (
        <div className="space-y-6">
          {verifierData.lastResult?.isValid &&
            verifierData.lastResult.location && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <Map className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        Location Information
                      </h3>
                      <p className="text-sm text-slate-600">
                        Verified address details and map location
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-slate-600 mr-3" />
                      <div>
                        <div className="font-medium text-slate-900">
                          {formatSuburbName(
                            verifierData.lastResult.location.location
                          )}
                          , {verifierData.lastResult.location.state}{" "}
                          {verifierData.lastResult.location.postcode}
                        </div>
                      </div>
                    </div>

                    {verifierData.lastResult.location.category && (
                      <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {verifierData.lastResult.location.category}
                      </span>
                    )}
                  </div>

                  {verifierData?.lastResult?.location?.latitude &&
                  verifierData?.lastResult?.location?.longitude ? (
                    <div className="space-y-3">
                      {/* <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">
                          Map Location
                        </h4>
                        <div className="text-xs text-slate-500">
                          {verifierData.lastResult.location.latitude.toFixed(6)}
                          ,{" "}
                          {verifierData.lastResult.location.longitude.toFixed(
                            6
                          )}
                        </div>
                      </div> */}
                      <div className="rounded-xl overflow-hidden border border-slate-200">
                        <iframe
                          width="100%"
                          height="350"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${verifierData?.lastResult?.location?.latitude},${verifierData?.lastResult?.location.longitude}&z=14&output=embed`}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Map className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">Map location unavailable</p>
                      <p className="text-sm">
                        Coordinates not provided for this address
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <Shield className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 mb-2">
              About Address Verification
            </h4>
            <p className="text-sm text-slate-600 mb-3">
              Our verification service uses official Australia Post data to
              validate postal addresses across Australia. This ensures accuracy
              for deliveries, billing, and location services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
