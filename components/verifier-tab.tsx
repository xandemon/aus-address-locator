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

        if (verificationResult) {
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[auto]">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm flex-1">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                Address Details
              </h3>
              <p className="text-sm text-slate-500">
                Enter the address information to verify
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                className={`border rounded-xl p-4 ${
                  verifierData.lastResult.isValid
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${
                      verifierData.lastResult.isValid
                        ? "bg-emerald-100"
                        : "bg-red-100"
                    }`}
                  >
                    {verifierData.lastResult.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3
                        className={`text-sm sm:text-base font-medium ${
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
                      } text-sm break-words`}
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
                className="w-full sm:w-auto sm:px-8 h-[50px]"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isVerifying ? "Verifying Address..." : "Verify Address"}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4 sm:space-y-6 flex-1 h-[auto]">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-slate-200">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Map className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                    Location Information
                  </h3>
                  <p className="text-sm text-slate-600">
                    Verified address details and map location
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 h-full">
              {verifierData?.lastResult?.location && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 mr-2 sm:mr-3 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-sm sm:text-base break-words">
                        {formatSuburbName(
                          verifierData.lastResult.location.location
                        )}
                        , {verifierData.lastResult.location.state}{" "}
                        {verifierData.lastResult.location.postcode}
                      </div>
                    </div>
                  </div>

                  {verifierData.lastResult.location.category && (
                    <span className="px-2 sm:px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full shrink-0">
                      {verifierData.lastResult.location.category}
                    </span>
                  )}
                </div>
              )}

              {verifierData?.lastResult?.location?.latitude &&
              verifierData?.lastResult?.location?.longitude ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <iframe
                      width="100%"
                      height="250"
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps?q=${verifierData?.lastResult?.location?.latitude},${verifierData?.lastResult?.location.longitude}&z=14&output=embed`}
                      className="w-full sm:h-[270px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-slate-200 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-4 left-4 w-8 h-8 bg-blue-400 rounded-full"></div>
                    <div className="absolute top-12 right-8 w-4 h-4 bg-indigo-400 rounded-full"></div>
                    <div className="absolute bottom-8 left-12 w-6 h-6 bg-purple-400 rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-3 h-3 bg-pink-400 rounded-full"></div>
                  </div>

                  <div className="text-center py-8 sm:py-12 px-6 relative z-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Map className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-base sm:text-lg">
                      {verifierData?.lastResult &&
                      !verifierData?.lastResult?.isValid
                        ? "Map Location Unavailable"
                        : "Ready for Your Address"}
                    </h3>
                    {verifierData?.lastResult && (
                      <p className="text-sm sm:text-base text-slate-600 mb-3">
                        {verifierData?.lastResult?.isValid
                          ? "Coordinates not provided for this address"
                          : "Validate with correct address details to view map here"}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <Shield className="w-4 h-4 text-slate-600" />
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-slate-900 mb-2 text-sm sm:text-base">
              About Address Verification
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
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
