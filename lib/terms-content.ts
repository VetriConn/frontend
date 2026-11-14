/**
 * The Terms of Service, as supplied by VetriConn.
 *
 * Kept as data rather than JSX so the legal text can be edited by somebody
 * who does not write React, and so the table of contents on the page is
 * generated from the same source it links to. If a section is renamed here
 * its anchor follows automatically.
 *
 * The wording is reproduced as given. Three things were noticed while
 * transcribing and are flagged rather than silently fixed, since changing a
 * legal document is not an engineering decision:
 *
 *  1. The refund section carries unfilled placeholders: "[customer service
 *     email]", "[Customer Service Phone Number]", "[Hours of Operation]".
 *  2. Contact addresses are inconsistent in domain casing, and the refund
 *     contact is a gmail address while the rest are @VetriConn.com.
 *  3. The source ended with a sentence addressed to the document's author
 *     rather than to a reader, offering to adjust the terms. That line is
 *     omitted here because publishing it would be publishing a draft note,
 *     not because the terms were edited.
 */

export type TermsBlock =
  | { kind: "p"; text: string }
  | { kind: "h3"; text: string }
  | { kind: "ul"; items: string[] };

export interface TermsSection {
  id: string;
  title: string;
  blocks: TermsBlock[];
}

export const TERMS_EFFECTIVE_DATE = "1 July 2025";

const p = (text: string): TermsBlock => ({ kind: "p", text });
const h3 = (text: string): TermsBlock => ({ kind: "h3", text });
const ul = (...items: string[]): TermsBlock => ({ kind: "ul", items });

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    title: "Introduction to VetriConn’s Terms of Service",
    blocks: [
      p("Each time you access or use VetriConn’s online or mobile platforms including any VetriConn websites, mobile applications, browser extensions, or plugins, regardless of where they are downloaded as well as any related software, services, features, products, programs, or communications (such as emails, notifications, or other messages) provided by or on behalf of VetriConn (collectively, the “Site”), you are:"),
      ul(
        "(a) confirming that you have read and understood our Cookie Policy and Privacy Policy;",
        "(b) agreeing to be bound by the current version of these Terms of Service (the “Agreement”) with the applicable VetriConn entity or entities.",
      ),
      p("The Site is intended solely for use by the following groups:"),
      ul(
        "Job Seekers: Individuals, including retirees and veterans, who are looking for employment, volunteer opportunities, or related services and information.",
        "Employers: Individuals and organizations seeking to hire, manage human resources, or share employment or volunteer opportunities, either on their own behalf or on behalf of others. This includes employment agencies and organizations purchasing services for multiple clients.",
        "Publishers: Individuals and organizations participating in the VetriConn Publisher Program.",
      ),
      p("By using the Site, you agree that your right to access and use it is strictly limited to these purposes. Any attempt to use the Site for other reasons will automatically revoke your license to use it."),
      p("Unless explicitly stated otherwise, VetriConn is not an employment agency or representative of any Job Seeker or Employer. VetriConn operates the Site solely as an independent contractor and does not have the authority to act on behalf of, or make hiring decisions for, any party. Nothing on the Site or in this Agreement should be interpreted as creating an agency or representative relationship between VetriConn and Employers or Job Seekers."),
      p("If you are using the Site as an employee or representative of an Employer or Publisher, you agree to this Agreement on behalf of both yourself and the organization you represent. You confirm that you have the authority to bind that Employer or Publisher to this Agreement."),
      p("If you require assistance accessing the Site using assistive technology, you can contact VetriConn at 1-647-889-9542 (Canada) or email accessibility@VetriConn.com."),
      p("You acknowledge that VetriConn holds copyright ownership over the Site and its services, including all compiled information and content provided through it."),
      p("VetriConn reserves the right to reject, remove, or limit the visibility of any User Content (as defined below), and may suspend or disable any account or restrict your access to the Site, in whole or in part, at its sole discretion, with or without notice. While we may provide a reason for such actions, we are not obligated to disclose all reasons for removal or account suspension. We retain the right to take any such action when we believe it is in our or our users’ best interests."),
      p("We may update this Agreement at any time by reasonable means, including posting the revised terms on the Site. Any changes will apply only to actions or claims made after the update date. Continued use of the Site following any such update will constitute your acceptance of the revised terms. The “Last Updated” date on each section indicates the most recent modification."),
      p("Additionally, VetriConn may, at any time and without liability:"),
      ul(
        "Modify or discontinue any part of the Site, including access via third-party links;",
        "Change, introduce, or waive fees related to the Site;",
        "Offer features or opportunities to some or all users.",
      ),
    ],
  },
  {
    id: "job-seekers",
    title: "A. Terms of Service for Job Seekers",
    blocks: [
      p("For the purposes of this Section A of VetriConn’s General Terms of Service, all references to “you” or “your” refer to you, the individual or organization using the Site as a Job Seeker. As a Job Seeker, you are authorized to use VetriConn’s Site and its content exclusively for non-commercial job search or volunteering purposes. You also agree that the Terms of Service for All Users apply. In the event of any conflict or overlap between these general terms and the Job Seeker-specific terms, the Terms of Service for Job Seekers will take precedence."),
      p("VetriConn may present Job Ads including job opportunities and other employment-related content, sometimes linking to third-party websites on the Site’s search results or elsewhere. These postings (“Job Ads” or “Job Listings”) are accessible free of charge to Job Seekers. The display of Job Ads is influenced by both employer compensation to VetriConn and factors like relevance, search behavior, and user activity. While VetriConn may be compensated by employers for certain job placements, all Job Ads are considered advertising."),

      h3("Job or Volunteer ads and listings"),
      p("Job Ads are created and managed by third parties, over whom VetriConn has no control. This includes the content of the Job Ads, the websites they link to, and any actions or conditions imposed by third parties once a Job Seeker leaves the VetriConn Site. For example, although VetriConn strives to avoid it, some third-party sites may attempt to charge an application fee for jobs. If you choose to leave VetriConn’s Site and visit an external website, you agree to be bound by that third party’s terms and conditions."),
      p("Unless otherwise specified (e.g., for featured or sponsored listings), Job Ads are indexed or posted automatically. VetriConn is under no obligation to display, review, or include any Job Ad in search results or listings and may remove any ad at its discretion, with or without explanation. You acknowledge that VetriConn is not obligated to show you any specific Job Ad, and does not guarantee the accuracy, completeness, or legitimacy of any ad or the identity of the Employer who posted it. VetriConn disclaims all liability related to the content, legality, reliability, or availability of Job Ads or other Employer-submitted information."),
      p("When you start a job application on an Employer’s website or through their applicant tracking system, VetriConn may use automated tools such as APIs, cookies, web beacons, or tracking pixels to collect information about your visit. This may include which job listings you viewed and the status of your job applications. Employers using this tracking technology are responsible for providing any legally required notices and obtaining necessary consent. VetriConn does not control these third-party websites. Any data VetriConn collects in this way will be handled in accordance with this Agreement and our Privacy Policy."),
      p("VetriConn may offer tools to assist your job search, such as filters to sort Job Ads by type (e.g., full-time, part-time, volunteer). These filters are independently developed by VetriConn and may not always accurately reflect the content of the Job Ads. In some cases, VetriConn may automatically apply filters based on your profile or activity, but you can disable them at any time. For better usability, VetriConn may reformat job listings for easier viewing on mobile devices."),
      p("Additionally, VetriConn may highlight Job Ads from select Employers on specialized pages, such as those focused on inclusive hiring or veteran-friendly roles. However, these placements do not constitute a legal classification of the job type (e.g., contract vs. employee) or an endorsement of the Employer. Applying to jobs featured on these pages does not guarantee a better experience, interview, or offer. These pages are not comprehensive, and no assumptions should be made about employers or opportunities not listed there."),
      p("VetriConn may also enable phone-call functionality for Job Ads through your mobile device’s phone app. However, VetriConn does not guarantee that the phone number shown is correct or belongs to the intended Employer."),

      h3("Resume and Profile"),
      p("When you create or update a profile or upload a resume on the VetriConn website (referred to collectively as “Your Profile,” “Job Seeker Profile,” or “VetriConn Profile”), you authorize VetriConn to make your Profile available to individuals and organizations using the Site such as Employers who may be interested in your qualifications, participants in VetriConn’s Resume Search or Smart Sourcing programs, or anyone with access to the URL of your searchable Profile. You can choose to make your Profile searchable to improve your visibility to potential employers. It is your responsibility to ensure your Profile remains current and accurate. All Profile-related information is subject to this Agreement and VetriConn’s Privacy Policy."),
      p("By default, Profiles are set to “Searchable.” If you prefer not to be contacted by employers or third parties, you can change your Profile settings to “Not Searchable” in your account. Profiles marked as Not Searchable will only be visible to employers to whom you’ve applied or shared your resume. However, please note that once your information has been shared, it may still be copied or distributed, even if you later change your Profile to Not Searchable. VetriConn cannot control how third parties may use or retain your information. Even when searchable, VetriConn may attempt to hide your Profile from current or past employers, though we cannot guarantee this protection."),
      p("If you do not want your information to be publicly viewable or copied, you must keep your Profile set to Not Searchable. VetriConn may also change your Profile to Not Searchable if it includes content that violates this Agreement or for any other reason, at VetriConn’s sole discretion. We are not responsible for any misuse of your Profile, resume, or application data by third parties or employers once shared."),
      p("We strongly advise against including sensitive personal details such as background checks, credit history, medical information, social insurance numbers, or other confidential identifiers in your VetriConn Profile. If such information is found, VetriConn may attempt to restrict access, but we cannot guarantee it will not be visible to others."),
      p("By uploading or adding a resume or information to your Profile, you allow VetriConn (or an approved vendor) to scan and analyze your data and provide optional feedback. This may include suggestions to improve your resume, highlight missing information, or recommend relevant job listings. Any feedback or suggestions are for your personal use and are not shared with employers. You remain fully responsible for the content of your resume and which jobs you choose to pursue. VetriConn is not liable for actions you take based on such feedback and makes no guarantees regarding job suitability or outcomes."),
      p("If you opt into VetriConn’s automatic application service, we may apply to job listings on your behalf based on your preferences. We may also highlight job listings or aspects of your Profile that match each other. These highlights are not endorsements and do not guarantee suitability, interview offers, or employment."),
      p("When you upload a resume file, VetriConn may convert it to another format for display purposes. You are responsible for reviewing your Profile and resume to confirm accuracy. If you notice any errors, you must correct them yourself or contact VetriConn. Profile and resume updates may take time to appear."),
      p("Your VetriConn Profile includes all information provided in the “Profile” section of your account such as your resume(s), desired job titles, job preferences, availability, qualifications, and compensation expectations. VetriConn may allow you to store multiple versions of your resume and may save new uploads automatically. We reserve the right to remove any resume or resume version at any time without notice. You are responsible for maintaining backup copies."),
      p("You may also choose to enable a “ready to work” feature, indicating immediate availability to employers. VetriConn may turn off this setting after a period of time, but you may reactivate it manually."),
      p("To help prevent fraud, VetriConn may mask your contact details (like your name, email, or phone number) with aliases or job titles. Employers may also mask their own contact details. As a result, you may not be able to respond directly unless the employer shares their actual contact information. VetriConn can change your Profile’s visibility settings to Not Searchable at any time, and we do not guarantee that any employer will view your Profile or that a particular employer will have access to the VetriConn Profile database."),
      p("In some regions, VetriConn works with third-party organizations that assist job seekers. While these entities may be referred to as “partners,” no formal legal relationship such as a joint venture or agency is created. If you give permission, VetriConn may share limited information with these organizations, such as whether you have created an account or applied to jobs. These partners may promote their services alongside VetriConn, but we are not responsible for their activities, advice, or services. You accept full responsibility for any engagement with these third-party groups."),
      p("In connection with such collaborations, VetriConn may allow you to highlight specific skills or credentials tied to training programs you’ve completed. However, you are ultimately accountable for your resume content, application decisions, and job search outcomes. VetriConn makes no promises that you will be contacted by employers, receive interviews, or get hired."),

      h3("Application Submission and Use of VetriConn Services"),
      p("Any profile, resume, or application materials you submit via the VetriConn platform including personal information contained in resumes, application responses, or screener answers are governed by this Agreement and VetriConn’s Privacy Policy. To ensure quality control of the Site and its Services, VetriConn reserves the right, at its sole discretion, to limit your access to certain job listings or services. The use of automation tools, scripts, or bots to submit applications outside of VetriConn’s authorized tools or partners is strictly prohibited."),
      p("Before submitting an application through VetriConn Apply, you will have the opportunity to review all information, including attachments. It is your responsibility to ensure the accuracy and completeness of this data and to confirm that you are applying to the correct Employer. You alone are accountable for all contents submitted, including attached files. Once submitted, VetriConn has no control over how Employers use or disclose your application materials. Requests to delete, modify, or restrict the use of submitted information must be directed to the Employer. Please note that opting out of employer communications through the Site does not cancel previously scheduled interviews. If you need to apply by alternative means, you must contact the Employer directly."),
      p("When you submit an application via VetriConn Apply, you authorize VetriConn to forward your application materials to the designated Employer(s) and allow automated processing of your information as outlined in this Agreement. VetriConn may reformat content as necessary and makes no guarantees regarding the successful transmission or formatting of submitted materials. Employer communications sent via the Site, such as offer letters, are also subject to this Agreement and the Privacy Policy."),
      p("Employers may request VetriConn to compile your application information (e.g., resume, screener answers) into a single document, which you agree may be done on your behalf. VetriConn will attempt to send your application to the contact information provided by the Employer or their agent, including through third-party systems like Applicant Tracking Systems (ATS). By applying, you consent to the Employer’s use of such third-party services, which may involve those intermediaries accessing your application. VetriConn cannot guarantee delivery or that the Employer will view, respond to, or act upon your application. Delivery failures due to inaccurate employer contact information or technical errors in ATS systems are outside VetriConn’s control."),
      p("Job postings may expire or be removed after you submit your application but before it is received. In such cases, your application becomes void. Applications may also be rejected for reasons such as duplication. VetriConn is not liable for expired listings, late delivery, or rejection of applications by Employers or third-party platforms. Your application may still be stored on VetriConn’s or its providers’ servers regardless of a job’s status."),
      p("If you prefer not to have your application or messages stored or transmitted by VetriConn or its providers, do not use the VetriConn Apply feature. Instead, send your application directly to the Employer through alternative means, such as postal mail."),

      h3("Employer Responsibilities and Compliance"),
      p("VetriConn is not responsible for the content or format of Employers’ job applications, screener questions, messages, or skill assessments, nor for ensuring delivery or receipt of any communications between you and the Employer. VetriConn does not control the questions asked by Employers or the job qualification criteria they establish. Employers are solely responsible for compliance with applicable laws, including equal opportunity, anti-discrimination, data protection, and accessibility laws (e.g., the ADA or Canadian equivalents). If you require alternative methods for application or screening, you must reach out to the Employer directly."),
      p("Some screener questions may be marked as optional, meaning you may submit your application without answering them; however, VetriConn cannot guarantee how the Employer will evaluate incomplete applications. Employers may request that applicants voluntarily provide demographic information, such as race, gender, disability, or veteran status. These questions are separate from VetriConn’s own demographic data collection and are the Employer’s responsibility."),
      p("VetriConn cannot guarantee the identity or legitimacy of any Employer or individual on the platform. Job Seekers are encouraged to exercise caution and verify the validity of job offers and the hiring process independently. VetriConn is not responsible for ensuring Employers follow health and safety protocols and advises Job Seekers to adhere to public health guidelines. You are solely responsible for confirming the legitimacy of any job offers and making informed decisions about your employment."),

      h3("Automated Notifications and Employer Assist"),
      p("By using VetriConn Apply and answering screener questions, you acknowledge that VetriConn may send rejection notices on behalf of Employers if your answers do not meet their criteria. VetriConn does not control these decisions and only facilitates the automated messaging based on Employer instructions."),
      p("Employers may also enable a feature called Employer Assist, authorizing VetriConn to send automated messages notifying Job Seekers of application rejection if the Employer does not take further action within a specified timeframe. These notices are issued based solely on the Employer’s direction and VetriConn is not responsible for their content or timing. If an Employer contacts you directly (e.g., via email or phone), this may not prevent a rejection message from being sent."),

      h3("Interview Scheduling and Recommendations"),
      p("VetriConn may facilitate interview scheduling on behalf of Employers based on your qualifications and the Employer’s criteria and availability. However, VetriConn does not control or guarantee the accuracy of scheduling, criteria, or availability. It is you and the Employer’s responsibility to confirm, reschedule, or cancel interviews. The decision to interview is entirely at the Employer’s discretion."),
      p("Some Employers may use VetriConn’s tools to categorize applicants based on how well their resumes or screener answers match specified criteria. These tools are intended for convenience only and do not constitute decision-making. Employers retain full control over their hiring decisions."),
      p("When applying through the VetriConn Job Search platform, the Site may suggest content from your VetriConn profile to include in your application. You are responsible for reviewing and approving any suggested information before submission."),

      h3("Fraud Prevention and Email Verification"),
      p("To reduce spam and fraud, VetriConn may require email verification. If you fail to verify your email address, your application may be rejected."),

      h3("Job Recommendations and Matching"),
      p("VetriConn provides job recommendations to both Job Seekers and Employers in various formats on the Site. These may include suggestions for job postings similar to ones you’ve applied to, highlighting specific features of job listings, or showcasing your profile to Employers if it aligns with their posted jobs."),
      p("To create these matches, VetriConn uses data collected from the Site, such as:"),
      ul(
        "Job postings,",
        "Your VetriConn Profile,",
        "Resumes and application materials (including responses to screening questions),",
        "Your interactions on the Site (e.g., job searches, clicks, applications).",
      ),
      p("We may send these recommendations to your registered email. If you prefer not to receive such job alerts, you can disable the “recommended jobs” setting in your account communications preferences. This setting doesn’t affect your profile’s visibility to Employers. To update your privacy settings, visit your Profile page."),

      h3("Communications and Data Use"),
      p("Anytime you send, receive, store, or interact with content on VetriConn (e.g., job postings, messages, resumes, interview responses), you consent to the processing and analysis of this data. This includes quality control, policy enforcement, content moderation, and site improvements. These actions may be performed manually or using automated tools, including AI and machine learning models."),
      p("We may work with third-party vendors to support these functions. If you disagree with these practices, please refrain from using the Site."),

      h3("Notifications and Employer Interactions"),
      p("When Employers take actions such as opening your application, pausing a job post, or responding to your profile, VetriConn may notify you via app, email, SMS, or in-platform messages. These alerts are provided as a courtesy, and their delivery isn’t guaranteed. For instance, if you accept an interview via VetriConn, you are responsible for confirming with the Employer directly."),

      h3("Interview Reminders and Text Messaging"),
      p("If an Employer schedules an interview, VetriConn may offer to send you text message reminders. By providing your phone number, you confirm it is yours and that you consent to receiving automated text reminders. You must update your account if your number changes. This service is optional and standard messaging rates may apply."),

      h3("In-App Messaging and Relay Services"),
      p("VetriConn offers messaging tools (e.g., VetriConn Messaging, email, text, call relays) to help Employers and Job Seekers communicate. Messages must be related to job applications. We may disable these services at any time without notice."),
      p("Relay services rely on third-party technology and may experience delays or errors. We cannot guarantee delivery, receipt, or display of any communication."),

      h3("Email Aliases and Messaging Policies"),
      p("VetriConn may use email aliases to protect your personal email. Once your contact information is shared with an Employer, VetriConn is not responsible for how it’s used. Communications sent through aliases may be analyzed for service improvement, and conversation grouping may vary across platforms."),
      p("Bulk messaging via VetriConn is not allowed unless explicitly permitted. Attempting to bypass these rules (e.g., via third-party email clients) is discouraged and may affect message display or delivery."),

      h3("Third-Party Email Integration"),
      p("You may choose to link your email account with VetriConn to track job applications. If enabled, VetriConn will scan your email for application-related data even for jobs applied to outside the platform and update your “My Jobs” section. You can disable this feature anytime in your settings. We do not guarantee the accuracy or completeness of this data."),

      h3("Additional Communication Features"),
      p("VetriConn may provide options to make calls to Employers directly from messages. Standard carrier rates apply. These features are offered as a convenience."),

      h3("Chatbots and AI-Generated Interactions"),
      p("VetriConn may use Chatbots and interactive AI tools to help you explore job opportunities or complete actions like scheduling interviews. All chatbot interactions are stored and analyzed to enhance VetriConn’s services."),
      p("These AI tools operate without human involvement and are subject to VetriConn’s Beta Terms. You are responsible for verifying the accuracy of AI-generated suggestions. VetriConn is not liable for errors or inaccuracies from these tools."),

      h3("Communication Feature Availability"),
      p("VetriConn may selectively enable messaging or chat for certain Employers or job listings. Whether you see these features depends on several factors, including Employer settings. VetriConn reserves the right to disable these options at any time."),

      h3("Managing Push Notifications"),
      p("To turn off browser or mobile push notifications, adjust your settings within your browser or mobile device."),

      h3("Text Message Notifications via Short Code"),
      p("If you have agreed to receive text messages, either: (i) related to employer communications and scheduled interviews on the platform (“Employer Responses and Interview Updates”), or (ii) from employers expressing interest in your profile (“Recruiter Invites”), the following terms apply."),
      p("Employer Responses and Interview Updates may include messages confirming interviews, reminders, cancellations, and direct communication from employers. You may opt out at any time by texting “STOP” to the corresponding short code or updating your preferences in Communication Settings. If you receive messages from both categories, you’ll need to text “STOP” to each short code individually to stop all communications. After opting out, you’ll receive a confirmation message and will no longer receive these notifications. To re-subscribe, opt-in again through Communication Settings or repeat the original sign-up process."),
      p("Note: To receive Recruiter Invites, your resume must be marked as Searchable."),
      p("If you encounter any issues, reply “HELP” or visit our Help Center. Standard message and data rates may apply. Frequency of messages may vary. For questions about your messaging or data plan, please contact your wireless provider."),

      h3("Virtual Interviews"),
      p("Employers may invite you to participate in virtual, recorded, or remote interviews using VetriConn features such as VetriConn Interview, Hiring Platform, Virtual Evaluations, or third-party tools. VetriConn is not a telecommunications provider and offers these tools via third-party services. As a result, we are not responsible for any technical issues, delays, or malfunctions related to phone or video communication."),
      p("VetriConn does not guarantee the performance, reliability, or security of these communications. We also cannot confirm the accuracy or legitimacy of contact details provided by employers. Any communication or decision related to the hiring process remains solely the responsibility of the employer. Employers are also responsible for any accessibility accommodations you may require."),
      p("Employers may indicate that they are available for live interviews through a job posting, but this status is not a guarantee of availability or selection."),

      h3("Notice: Virtual Interviews May Be Recorded"),
      p("Employers may enable recording during a virtual interview, or you may be asked to submit a pre-recorded interview. You must comply with any visual, audio, or other notice indicating recording. If you do not agree, do not proceed with the interview. By participating, you consent to the recording being stored, accessed, and analyzed by VetriConn and its third-party providers. Employers may access, use, and share these recordings independently of VetriConn."),
      p("To the fullest extent permitted by law, you understand and accept that:"),
      ul(
        "No information you share during a Virtual Interview is guaranteed to be secure or protected.",
        "VetriConn does not ensure the availability, integrity, or retention of any virtual interview recordings.",
        "You use Virtual Interviews at your own risk, and VetriConn disclaims all liability related to your participation.",
      ),

      h3("Screening Tools"),
      p("VetriConn may provide optional screening tools (e.g., screener questions, assessments) for employer use during the hiring process. Employers independently decide whether to use these tools, what questions to ask, and how to evaluate responses. VetriConn is not involved in this decision-making process and is not acting as an employment agency. Employers alone are responsible for how they may use these tools and for ensuring compliance with relevant laws, including offering alternative formats for candidates with disabilities."),

      h3("Career Services"),
      p("VetriConn offers a range of career-related services (“Career Services”), which may include resume reviews, writing help, offer negotiation coaching, live consultations, and general job-search guidance. These services are provided either by VetriConn or its vendors and are intended solely for your personal use. Occasionally, we may share career advice or tips via blog posts, email, chat, or AI-generated content."),
      p("These tools are for informational purposes only and are not substitutes for professional career counseling unless explicitly stated. You agree to verify and edit all materials (e.g., resumes, feedback, job tips) before using them, as VetriConn makes no guarantees regarding their accuracy, effectiveness, or outcomes such as job placement or salary increases."),
      p("All materials provided through Career Services remain the property of VetriConn, which grants you a limited, non-exclusive, non-transferable license for personal use only."),
      p("Some services may involve communication with third-party career coaches or writers, who are not employees of VetriConn. You should not share sensitive or confidential information with them. VetriConn is not liable for any advice or decisions resulting from these discussions."),
      p("Live video features in Career Services are hosted on third-party platforms such as Whereby. By using these features, you agree to Whereby’s privacy policy."),

      h3("Payment, Cancellation and Termination"),
      p("If you purchase any Career Services, you will be charged as shown on the Site. Refunds, if any, are granted solely at VetriConn’s discretion."),
      p("For Job Seekers in British Columbia and Newfoundland and Labrador: You may cancel within 10 days of receiving the services. If services aren’t delivered within 30 days of the contract date, you may cancel within one year. You forfeit this right if you accept the service after the 30-day period. Refunds must be processed within 15 days of cancellation. Contact: career-services@VetriConn.com"),
      p("VetriConn may suspend or terminate your access to Career Services at any time, with or without notice. You may also cancel your use of these services at any time. VetriConn reserves the right to deny services to anyone, for any reason."),

      h3("Informational Content and Salary Estimates"),
      p("VetriConn may provide users with salary estimates, job application data, screener response trends, and probabilities of certain outcomes such as the likelihood of being selected for an interview. These insights are offered strictly for informational purposes. Salary figures and other data are approximations, generated from various sources, including AI-generated content, user submissions, third-party data, and VetriConn affiliates."),
      p("These figures should be viewed as general comparisons only and are not guaranteed to be accurate or up-to-date. Actual salaries may vary by employer, region, and job specifics. Always consult the employer for precise compensation information. Minimum wage standards differ across jurisdictions."),

      h3("Labels and Badges on Employers and Jobs"),
      p("VetriConn may assign labels or badges to employers or job listings, such as “Verified Employer” or “Active Employer”. These labels are based on data VetriConn collects, which may include employer-provided information. Employers may also request certain labels, but VetriConn determines the eligibility and assignment criteria at its sole discretion."),
      p("The absence of a badge does not imply a negative status; it may simply mean VetriConn lacks sufficient data. Badges may also indicate job features such as pay types, benefits, or union affiliations, based on the job description. However, VetriConn does not guarantee the accuracy of any badge or label."),

      h3("Company Pages"),
      p("VetriConn may display public or third-party-generated information about employers on their Company Pages. This information is presented for informational and promotional purposes only and is subject to change. VetriConn does not guarantee the accuracy of this content. For the most reliable and current information, please contact the employer directly."),

      h3("Job Seeker Activity and Data Collection"),
      p("When you interact with VetriConn, we collect information about your actions, including:"),
      ul(
        "Job searches and viewed listings",
        "Application activity",
        "Resume content and profile data",
        "Desired salary and experience",
        "Activity timestamps and engagement levels",
      ),
      p("Because this data is generated from your use of the site, you are fully aware of what is collected. By using the platform, you agree that VetriConn may collect, analyze, store, and use this data including interactions and communications made through the platform for operational and analytical purposes."),
      p("We may also share some of this data with employers, such as whether you’re online, recently active, or responsive to messages. If your profile is marked as “Searchable,” your profile data and behavior may be shared with third-party employers for potential job matches. If you prefer not to share this information, you may switch your profile to “Not Searchable.” Please note, profile changes may take a few days to update across the system."),

      h3("Employer Tracking During Applications"),
      p("When you apply for a job through an employer’s website or their applicant tracking system, VetriConn may automatically collect information using tracking technologies such as cookies, APIs, and pixels. This may include which listings you view and the actions you take during the application process."),
      p("While employers are responsible for providing the legally required notices and obtaining any necessary consents, VetriConn does not control or manage these employer systems. By using the platform, you consent to VetriConn collecting and using this information, even when obtained from external employer sites."),

      h3("Personalized Job Matching"),
      p("Your profile and behavior on VetriConn may be used to:"),
      ul(
        "Suggest jobs to you",
        "Suggest your profile to employers",
        "Enable VetriConn or employers to contact you",
      ),
      p("These recommendations are based on the data you provide and your activity on the site. VetriConn may also indicate to third parties that you’ve recently been active or engaged on the platform, without disclosing specific details unless your profile is searchable."),
      p("VetriConn may also add labels such as “Responsive Candidate” or “New Applicant” to user profiles, based on site activity. These labels are determined at VetriConn’s discretion and may be added, changed, or removed at any time. Lack of a label typically indicates insufficient activity data."),

      h3("Demographic Data"),
      p("You may choose to provide optional demographic information, such as race, gender, age, disability status, or criminal history. If provided, VetriConn may use this data to improve its services and share aggregated, anonymized insights with employers."),
      p("You can request that your demographic data be deleted at any time. If you do not wish for it to be used, do not submit it. You also agree that you have no right to view the demographic data of other users."),
      p("Employers may separately request demographic information during their job application processes. These requests are not controlled by VetriConn, and are subject to the employer’s own policies. VetriConn is not responsible for employer practices or application questions. If you have concerns, contact the employer directly."),

      h3("Legal Disclosures"),
      p("VetriConn may disclose your information if required to comply with legal obligations, government requests, or to defend its legal rights. This may include disclosing demographic data in response to valid court orders or law enforcement inquiries."),

      h3("Class Action Waiver and User Agreement Acknowledgment"),
      p("By accessing and using the VetriConn Site, you acknowledge and accept that the services provided are offered strictly under the terms and conditions set forth in this Agreement. In exchange for the use of these services, you agree not to initiate, join, or participate in any class action lawsuit or collective legal proceeding against VetriConn. This includes acting as a class representative, class member, or in any other representative capacity in litigation arising from your use of the Site."),
      p("If you do not agree to any part of these terms, you must discontinue your use of the Site immediately. This provision does not restrict your right to pursue an individual legal claim, including in small claims court, as outlined in Section 11 of this Agreement."),

      h3("Job Seeker Indemnification"),
      p("You agree to indemnify, defend, and hold harmless VetriConn, its affiliates, agents, and licensors from any claims, liabilities, damages, losses, or expenses (including reasonable legal fees) arising out of or relating to:"),
      ul(
        "(a) Your breach of any provision of this Agreement;",
        "(b) Your use of, or access to, the Site or any VetriConn service, product, or program;",
        "(c) Any loss, misuse, or disclosure of data obtained through the Site or VetriConn services;",
        "(d) Your violation of any applicable laws or regulations including, but not limited to, the Fair Credit Reporting Act, employment laws, equal opportunity laws, anti-discrimination statutes, or data protection and privacy laws (including where VetriConn acts on your behalf);",
        "(e) Infringement of any third-party rights, including intellectual property, privacy, or proprietary rights;",
        "(f) Any content you post or submit that causes harm or damages to a third party;",
        "(g) Your conduct as an Employer, including actions or omissions related to hiring, screening, promoting, or demoting job candidates or employees;",
        "(h) The actions or services of third-party vendors or service providers you engage to support your use of VetriConn offerings (e.g., recruitment tools, analytics, or conversion tracking tools).",
      ),
      p("This indemnity obligation survives the termination of this Agreement and your use of the Site or any VetriConn product or service."),
    ],
  },
  {
    id: "employers",
    title: "B. Employer Terms of Service",
    blocks: [
      p("These terms apply to all individuals or organizations (“Employers”) using the Site to share employment opportunities, including agencies acting on behalf of others. By using the Site in this capacity, you also agree to the Terms of Service for All Users. In the event of any conflict, the Employer Terms will take precedence."),
      p("For this section, “you” or “your” refers to the individual or organization accessing the Site as an Employer."),

      h3("Employer Accounts"),
      p("When you create a VetriConn account, Company Profile, or post job opportunities (“Job Ads”), including through paid services or otherwise, you agree to comply with this Agreement, any applicable VetriConn service terms, and VetriConn’s Privacy and Cookie Policies."),
      p("You may be asked to verify your identity using third-party verification services (e.g., ID.me or Persona). Any information you provide to these services is handled directly by them and subject to their privacy practices. VetriConn does not collect or store any biometric or sensitive personal data shared with third-party verifiers."),
      p("If you are creating or managing an Employer account on behalf of an organization, you represent that you have the authority to bind that entity to this Agreement. The Employer is the account owner, and any actions or data provided through the account (e.g., updates, communications) may be visible to the organization."),
      p("Employer accounts are for business use only. You must use a valid email address, and VetriConn disclaims responsibility for any misuse of your email by third parties. By registering, you consent to receive system-generated emails regarding your account."),
      p("Employers may request that VetriConn deactivate an account by contacting support. However, business records associated with that account may be retained to comply with legal obligations. For personal data inquiries or deletion requests, please refer to VetriConn’s Privacy Policy."),
      p("In some cases, multiple users may share access to the same account (“Linked Accounts”). Account administrators (“Admins”) may assign various permission levels (“Roles”) to users. These Roles may include access to sensitive data, billing actions, or the ability to manage job listings. Admins are responsible for managing access and agree to indemnify VetriConn for any consequences arising from account use or data sharing."),
      p("Users of Linked Accounts should understand that certain actions, such as sending or receiving applications, may be visible to other linked users. Linked users may also be authorized to make purchases, and the account owner is responsible for all related charges. Users may unlink accounts in their settings or be removed by Admins."),
      p("If your account has a saved payment method, VetriConn may charge it for services rendered or to correct billing issues."),
      p("VetriConn may notify job seekers if an Employer account is compromised, but such notifications are not guaranteed. VetriConn disclaims liability for any errors, delays, or failures related to these communications."),
      p("We may offer tools, tips, or recommendations to improve your experience, but these are optional and offered without warranty. You are solely responsible for:"),
      ul(
        "The content of your job ads",
        "Meeting legal requirements, including wage and hiring laws",
        "Interviewing and hiring decisions",
      ),
      p("VetriConn may limit or remove job postings that do not comply with laws (e.g., minimum wage or wage transparency laws), but ultimate compliance is your responsibility."),
      p("You may have the option to delete candidate or application data from your dashboard. Deleted data is not recoverable, and VetriConn does not retain employment records on your behalf. You are responsible for complying with any recordkeeping laws relevant to your organization."),

      h3("Employer Services and Candidate Management"),
      p("As part of VetriConn’s services to Job Seekers, we may enable our Apply relay function for your job postings. This allows candidates to express interest in your listings directly through the platform. Applications submitted this way will be forwarded to the email address you provide."),
      p("We may also enable features like automated chatbots that allow candidates to apply by answering pre-set questions. Their responses will be compiled and presented to you as part of their job application."),
      p("When using VetriConn’s candidate management tools including your Employer Dashboard or other functions, we may present tools to help you manage applicants, such as scheduling interviews, viewing resumes, or rejecting candidates. We may compile all candidate materials, including resumes and screener question responses, into a single file or view for your convenience. However, VetriConn does not store application data permanently and is not responsible for compliance with legal data retention or recordkeeping obligations. You are solely responsible for storing, managing, or deleting candidate information in accordance with applicable laws."),
      p("Candidate summaries may be generated for select applicants based on information you provide and what the candidate submits. These summaries are not employment recommendations. You must independently evaluate each candidate. If any verification data appears (e.g., certifications or qualifications), you are responsible for confirming its accuracy."),
      p("Regardless of whether you use the Site directly or through an Applicant Tracking System (ATS), you are solely responsible for all job-related content you create or distribute. This includes emails, applications, screener questions, criteria for interviews, job ads, company pages, and any other communication with candidates. VetriConn is not liable for the legality or accuracy of this content. You must ensure all such content complies with laws such as minimum wage, wage transparency, and equal employment opportunity regulations."),
      p("If your application includes optional self-identification questions (e.g., about demographics or disability status), you are fully responsible for compliance with all relevant laws, including how questions are asked and how responses are used."),
      p("You must update or close job postings in a timely manner and respond appropriately to candidate accommodation requests. You are responsible for ensuring selection criteria are lawful and that your process does not discriminate against candidates based on disability or other protected categories. If required by law, you must offer alternate screening methods and clearly inform applicants about the availability of accommodations."),
      p("VetriConn reserves the right to remove or reject any job posting or candidate question for any reason. This includes content that directly or indirectly discriminates against protected groups. You are responsible for ensuring your requirements and criteria are job-related and lawful. We do not guarantee the delivery of candidate materials or notifications and advise that you check your Employer Dashboard regularly."),
      p("If a message is directed to a closed account, it may not be delivered. If you prefer not to use our relay system (e.g., to send offer letters), you should contact applicants directly using other methods. If you provide incorrect contact information, you are responsible for correcting it and managing any related privacy implications."),
      p("We may enhance Apply-related emails or send reminders or status updates to candidates on your behalf. You may also choose to have automatic rejection notices sent to candidates who don’t meet your criteria. You acknowledge that these features are system-generated, transmission is not guaranteed, and VetriConn is not responsible for errors in delivery or candidate responses."),
      p("VetriConn may help highlight your job requirements to assist Job Seekers in evaluating their fit for a role. We do not verify candidate identity or motivations and cannot guarantee the accuracy of their applications or qualifications. Communications between you and Job Seekers are your responsibility."),
      p("You agree to indemnify VetriConn and its affiliates against any claims arising from your job postings, application materials, communications, self-identification questions, or use of candidate data. We may share analytics or performance metrics with others in your organization and reserve the right to suspend services if you have an unpaid balance. Late payments may incur interest and collection fees."),
      p("We may use any data or activity related to applications, resumes, interviews, or job ads for quality control, analytics, and service improvements. This includes informing candidates when actions are taken on their applications (e.g., viewed, paused, or closed) or when an Employer is inactive."),
      p("VetriConn may add visual labels (e.g., “Active Employer,” “Verified”) to job listings or company names at our discretion. These indicators do not guarantee employer activity or response, and their presence or absence does not imply endorsement or qualification."),
      p("If you access VetriConn services via an Application Programming Interface API (including third-party ATS integrations), you agree to abide by this Agreement, all related policies, and applicable data protection laws. You are responsible for the actions of any third-party developers you engage and for ensuring all data shared complies with privacy laws. You agree to indemnify VetriConn for any issues arising from your API use."),
      p("We may ask candidates to verify their email addresses as part of fraud prevention, but verification is not guaranteed. You are responsible for any tools you use that filter applications based on verification status."),
      p("If you use tools that request demographic or disability status data from applicants, you represent that you are legally required to do so (e.g., under federal contractor requirements). Use of this feature is at your own risk, and VetriConn disclaims liability for your compliance with related legal obligations."),

      h3("Job Matching and Related Information"),
      p("VetriConn may present job recommendations (“Job Matches”) to both Employers and Job Seekers in various formats throughout the platform. For example, we may suggest candidate resumes that align with your posted Job Ads or recommend your job listings to Job Seekers who have applied to similar positions. This matching functionality is currently offered as a beta feature and is subject to the Beta Program outlined in Section 9 of the Terms of Service for All Users."),
      p("To deliver these matches, VetriConn uses data from both Employers and Job Seekers, including Job Ads, resumes, application responses (such as answers to screener questions), and site interactions like search behavior and job applications. This information may be used to present relevant matches to both parties."),

      h3("Salary Estimates, Application Predictions, and Informational Content"),
      p("Any salary data provided on the platform is an approximation based on submissions from third-party sources, including affiliates. These figures are for general comparison only and are not guaranteed to be accurate. Metrics like ad impressions or estimated application counts are also provided as informational tools and may change at any time without notice."),
      p("VetriConn may offer job post templates or estimated application figures to help you craft your listings. By using these tools, you acknowledge that you are solely responsible for ensuring your job postings are accurate, legal, and compliant with all applicable laws. These tools may incorporate third-party data and are offered without warranty."),
      p("We may also add visual indicators (such as labels or badges like “Responsive Candidate” or “New Applicant”) to Job Seeker profiles. These are based on user activity and behavior on the platform and may not always be available. VetriConn does not guarantee the accuracy of these labels and may modify or remove them at any time."),

      h3("Screening Tools and Employer Assist"),
      p("VetriConn may provide screening tools such as screener questions, phone screening options, or automated scheduling tools. These are licensed to you for optional use. You are solely responsible for choosing which tools and questions to use, and for ensuring compliance with applicable laws, including but not limited to anti-discrimination, employment, and data protection regulations."),
      p("You must ensure your screening methods are job-related and non-discriminatory. For example, questions must not request medical or disability-related information unless legally permitted. You are also responsible for clearly offering reasonable accommodations to applicants who request them and for monitoring your inbox for such requests."),
      p("If you enable “Employer Assist,” VetriConn may send messages on your behalf to inform applicants that their application will not proceed unless you indicate interest within a specified timeframe. Any interactions conducted outside the platform (e.g., direct emails or phone calls) will not prevent these messages from being sent. You are responsible for ensuring you meet your response obligations under Employer Assist, and agree to indemnify VetriConn against any claims related to these communications."),
      p("In some cases, VetriConn may offer grouping or filtering tools that categorize applicants based on their qualifications or screener responses. You can view all applicants at any time, and these tools do not make hiring decisions. You agree not to rely solely on these features for hiring decisions, and to use them only as a supplementary aid."),

      h3("Communications Through the Platform"),
      p("You may receive notifications by email, SMS, or through your VetriConn dashboard regarding your own activity or that of Job Seekers. These alerts are provided as a courtesy and should not be relied upon. For example, if you intend to schedule an interview, it is your responsibility to confirm the meeting directly with the applicant."),
      p("We may enable communication tools like email relay, text messaging, or in-platform messaging to facilitate Employer and Job Seeker contact. These tools are subject to third-party providers and may be impacted by technical issues outside of VetriConn’s control. We do not guarantee message delivery, readability, or timeliness."),
      p("Contact details such as phone numbers or email addresses may be masked to protect privacy. You may see and be seen via alias addresses or numbers. If you choose not to include your actual contact information, applicants may be unable to reach you once the alias expires."),
      p("All messages, recordings, or communications sent via the platform may be processed for moderation, quality control, analytics, or feature improvement. This may include the use of automated tools and AI models. Messages sent to multiple Job Seekers may be split into individual threads. You agree not to misuse the messaging system to send bulk messages unless explicitly allowed."),
      p("If you or a third-party developer use any integrations (e.g., Applicant Tracking Systems via API), you are responsible for complying with all data protection and legal obligations. VetriConn disclaims liability for third-party actions and reserves the right to audit, suspend, or terminate access at its sole discretion."),

      h3("Company Profiles and Employer Branding Features"),
      p("When you post a job directly on the Site, VetriConn or its affiliates may automatically create a Company Profile or Employer Page for your organization. These pages may include publicly available information about your company, displayed in compliance with applicable laws. VetriConn may claim these pages on your behalf and mark them as “Claimed,” allowing you to manage, edit, and supplement the information displayed."),
      p("You acknowledge that Company Pages may include user-generated content submitted by individuals unaffiliated with your organization. VetriConn may also aggregate and display all your job postings whether submitted directly to the platform or indexed from other sources on your Company Page. You are solely responsible for any content you upload, including images, videos, and outbound links, and for ensuring all such materials comply with applicable laws."),
      p("VetriConn may offer selected employers the opportunity to appear more prominently on the Site (e.g., “Featured Employer”), based on criteria such as job ad volume or advertising spend. This designation is granted solely at VetriConn’s discretion and may be modified or discontinued at any time without notice."),

      h3("HR Management Tools"),
      p("VetriConn may provide access to HR management tools for use by employers and their staff. If you are an employee using these tools, your use is subject to these Terms of Service. VetriConn provides these tools as a software service only and does not accept responsibility for how they are configured or used. Employers are solely responsible for ensuring the tools are used in compliance with all applicable laws. VetriConn does not provide legal advice. If you have concerns about the use of these tools, please consult your employer directly."),

      h3("Employer Class Action Waiver"),
      p("In exchange for the services provided by VetriConn, you agree not to file or participate in any class action lawsuit against VetriConn related to your use of the Site or its services. This includes not acting as a class plaintiff, class representative, or joining as a class member in any such proceedings. This waiver does not limit your right to pursue legal action as an individual, including in small claims court. Additionally, you waive the right to a jury trial in any dispute related to your use of the Site or this agreement."),

      h3("Employer Indemnification"),
      p("You agree to indemnify and hold harmless VetriConn, its affiliates, agents, and licensors from any claims, damages, or legal costs arising from:"),
      ul(
        "(a) your violation of this Agreement;",
        "(b) your use of the Site or related services;",
        "(c) any data you disclose or lose through the platform;",
        "(d) your failure to comply with applicable laws, including employment, anti-discrimination, privacy, or data protection laws;",
        "(e) violations of third-party rights, including intellectual property or privacy;",
        "(f) content you publish or share that causes harm to others;",
        "(g) any employment-related actions you take (e.g., screening, hiring, promotions); or",
        "(h) the conduct of third-party service providers you engage for hiring or recruitment purposes.",
      ),
      p("This indemnification obligation survives the termination of your use of the Site."),

      h3("Candidate Data Import"),
      p("VetriConn may offer functionality that allows you or authorized third parties acting on your behalf to upload or synchronize candidate data into the platform (“Candidate Import”). This includes interacting with candidates and authorizing VetriConn to communicate with them on your behalf."),
      p("If this data includes personal information (“Client Personal Data”), you instruct VetriConn to process it under the terms of this Agreement and any applicable Data Processing Addendum (DPA). You confirm that you have secured all necessary permissions, consents, and legal rights to provide this data to VetriConn, including compliance with data protection laws. You warrant that:"),
      ul(
        "(a) No candidate has objected to the sharing of their data with VetriConn; and",
        "(b) All individuals have consented to be contacted by VetriConn as part of your recruitment process, including potential account creation.",
      ),
      p("You are responsible for the data you provide until it is received by VetriConn. Once received, VetriConn will handle it per the DPA and applicable privacy standards. You agree to indemnify VetriConn for any claims arising from your breach of these representations."),
    ],
  },
  {
    id: "publishers",
    title: "C. VetriConn Terms of Service for Publishers",
    blocks: [
      p("These VetriConn Publisher Program Terms (“IPP Terms”) apply to any entity (“You” or “Publisher”) that accesses, uses, or participates in the VetriConn Publisher Program (the “Program”), utilizes any VetriConn Application Programming Interface (“API”) related to job publishing (such as the Publisher API or Publisher Job Search API), or otherwise agrees to these IPP Terms. “VetriConn” refers to VetriConn, Inc. For the purposes of this Section C of the VetriConn General Terms of Service, “Publisher” also includes any party identified in an enrollment form, application, or questionnaire, including any agency or network acting on their behalf, all of whom are bound by these IPP Terms."),

      h3("Compensation Disclaimer"),
      p("Publishers will not receive any monetary compensation, including commissions, for participating in the Program or using any related services. No payment will be made for clicks or transactions, whether generated directly by the Publisher or indirectly through a third party. Additionally, VetriConn reserves the right to withhold payment in cases of fraudulent or artificial activity, or if the Publisher is found in breach of these Terms. Any click statistics or dashboards displayed are for informational purposes only and are not contractually binding."),

      h3("Termination and Suspension"),
      p("VetriConn reserves the right to suspend or terminate the Publisher Program at any time, for any reason, with or without notice or liability. Either party may end participation in the Program or these IPP Terms at any time, for any or no reason, without prior notice. To terminate participation, a Publisher must notify VetriConn by emailing support@VetriConn.com or any other address specified by VetriConn."),
      p("Upon termination, the Publisher’s access to the API will be revoked, and the Publisher must immediately remove all insertion codes and Program-related elements from its websites. All provisions that are inherently intended to survive termination including confidentiality, disclaimers, indemnification, and limitations of liability will remain in effect."),

      h3("Confidentiality"),
      p("The Publisher agrees not to disclose any VetriConn Confidential Information without prior written consent. Confidential Information includes, but is not limited to:"),
      ul(
        "All software, technologies, code, specifications, documentation, materials, and guidelines provided as part of the Program;",
        "Performance metrics such as click-through rates;",
        "Any information designated by VetriConn as “Confidential” in writing or equivalent.",
      ),

      h3("Publisher Indemnification"),
      p("The Publisher agrees to indemnify, defend, and hold harmless VetriConn, including its affiliates, agents, licensors, and partners, from any third-party claims, damages, or liabilities (including reasonable legal fees) arising out of:"),
      ul(
        "Use of the Program;",
        "Publisher’s website or services;",
        "Any breach of these IPP Terms.",
      ),

      h3("Publisher Class Action Waiver"),
      p("By using the Site or any Program-related services, the Publisher acknowledges that VetriConn is providing these services free of charge and subject to these IPP Terms. As part of this exchange, the Publisher agrees not to file, join, or participate in any class action lawsuit against VetriConn related to its use of the Site or the Publisher Program. This includes acting as a class representative, plaintiff, or member in such proceedings."),
      p("This waiver does not restrict the Publisher’s right to file a lawsuit individually, including in small claims court. If the Publisher does not agree to these terms, they must immediately discontinue use of the Site, the Program, and all related services."),
    ],
  },
  {
    id: "all-users",
    title: "D. Terms of Service for All Users",
    blocks: [
      h3("General Terms of Use"),
      p("These terms apply to anyone who accesses, uses, or attempts to use any part of the VetriConn website (the “Site”). By using the Site, you agree to comply with these terms. If you do not agree with any part of this Agreement or choose not to authorize the described activities, do not use the Site. You also confirm that you have read and understood VetriConn’s Cookie Policy and Privacy Policy. For details on how VetriConn complies with the Digital Services Act, see Section E."),

      h3("Data Collection and Use"),
      p("By using the Site, you consent to VetriConn collecting and analyzing all activity and communications on or through the platform. This includes your browsing behavior (clicks, scrolls, searches, time spent, etc.), content views, applications submitted, messages sent, interactions with support, and more whether you’re using a regular browser or a private or incognito mode. VetriConn may use vendors to help collect, process, and analyze this data to improve services, enforce policies, conduct quality control, and support AI or machine learning systems. You will not receive any payment or compensation related to this use."),

      h3("Browser and Device Storage"),
      p("The Site may store data (text, images, etc.) on your device. You can remove this data by clearing cookies. For further control over tracking technologies, refer to our Privacy Policy."),

      h3("Site Improvements and Testing"),
      p("We regularly test updates and features, which may impact things like ad displays, job recommendations, formatting, or application flow. These tests may occur without notice. VetriConn’s services may also vary by location."),

      h3("Guidance and Suggestions"),
      p("Any suggestions, insights, or recommendations you receive on the Site are provided for your convenience and are not guaranteed. Use them at your own discretion. VetriConn is not liable for outcomes based on this information."),

      h3("User Content"),
      p("Users may upload content such as job ads, resumes, reviews, images, videos, and messages (“User Content”). VetriConn does not verify the accuracy of User Content and is not responsible for its reliability, completeness, or legality. You may encounter content that you find offensive or inaccurate."),

      h3("Content Moderation and Rules"),
      p("User Content must comply with our Site Rules and Terms of Service. Content must not include illegal, discriminatory, obscene, threatening, or confidential material, nor should it contain spam, solicitations, or personal identification details (e.g., Social Security numbers or medical data). VetriConn reserves the right to remove or restrict User Content at its discretion and to block users who violate policies."),

      h3("Public Display and Identification"),
      p("If you submit reviews or other content about an employer, it may be publicly displayed with your job title, location, and employment status. Do not submit information you don’t want made public."),

      h3("Monitoring and Reporting"),
      p("VetriConn may monitor User Content for rule violations and take moderation actions. However, our detection systems are not perfect, and VetriConn does not guarantee that reported content will be removed."),

      h3("Disclosure and Legal Requests"),
      p("VetriConn may disclose User Content and related information in response to legal obligations, such as court orders or government inquiries. Anonymous posts may still be traceable through legal processes."),

      h3("Editorial Discretion"),
      p("VetriConn is not obligated to host, display, or maintain any specific User Content. Decisions about what to publish or remove are entirely at VetriConn’s discretion."),

      h3("User Content License"),
      p("By posting content, you grant VetriConn a non-exclusive, worldwide, royalty-free, perpetual license to use, distribute, modify, and display your content, including for marketing and training purposes. This license continues even after your content is removed from the Site. You will not receive compensation for this use and waive all rights to any associated claims."),
      p("If your content includes your name, image, or likeness, you also waive any rights of publicity and allow VetriConn to use this content in marketing or promotional materials."),

      h3("Your Responsibilities"),
      p("You confirm that you have the rights to share your content and that doing so does not violate any laws or rights of others. You are responsible for any royalties, claims, or damages arising from your content. You also agree to indemnify VetriConn against any claims related to your content."),

      h3("Revoking Content Rights"),
      p("To request removal of your content and revoke VetriConn’s license, send a certified letter with identification and details of the content to VetriConn’s mailing address. Include a statement under penalty of perjury affirming your authority to make the request."),

      h3("Feedback and License to Use"),
      p("You may choose to share Feedback or suggestions with VetriConn for example, reporting bugs, proposing improvements, or offering general opinions about the Site or its services. By providing Feedback, you give VetriConn the unrestricted right to use, reproduce, distribute, sublicense, display, or modify it for any purpose, without compensation to you. This license is worldwide, perpetual, irrevocable, royalty-free, and fully sublicensable. VetriConn may also share your Feedback publicly or with third parties. Providing Feedback does not restrict VetriConn’s right to use similar ideas that it already had, developed internally, or received from other sources."),

      h3("Site Rules and Prohibited Conduct"),
      p("By using the Site, you agree to follow these rules and all other VetriConn policies. Violating them is a serious breach of this Agreement and may result in penalties, including removal of your content, suspension of access, or termination of your account without prior notice."),
      p("You must not, directly or indirectly:"),
      ul(
        "Access the Site by any means other than the public-facing web or app interfaces.",
        "Attempt to access parts of the Site or systems without proper authorization.",
        "Provide false, deceptive, or fake information.",
        "Upload or transmit code or data designed to harm or interfere with the Site or any system.",
        "Harvest, access, or attempt to retrieve data especially personal data without permission.",
        "Use the Site in any way that disrupts, disables, or impairs its performance or services.",
        "Circumvent any usage limits or technical restrictions on the Site.",
        "Submit applications or content in bulk using unauthorized automation tools.",
        "Submit applications or content that is spammy, malicious, fraudulent, or misleading.",
        "Interfere with others’ ability to use the Site.",
        "Copy, reformat, reverse-engineer, or resell any part of the Site or its content.",
        "Remove any legal or proprietary notices on the Site.",
      ),
      p("You are also prohibited from using the Site to:"),
      ul(
        "Harm others or violate their rights, including privacy and intellectual property rights.",
        "Transmit false or misleading information.",
        "Store or transmit biometric identifiers or data.",
        "Promote illegal activities or deceptive schemes.",
        "Advertise or promote pyramid schemes or jobs that require payment to start.",
        "Send unsolicited or unlawful commercial messages.",
        "Impersonate others or create fake accounts.",
        "Contact users who have opted out of communications.",
        "Send texts or make calls unrelated to legitimate job application activity.",
        "Sell or misuse personal data.",
      ),

      h3("Monitoring, Spam Prevention, and Enforcement"),
      p("VetriConn may monitor all Site activity and block or prevent messages or submissions that it determines to be spam, malicious, fraudulent, or otherwise inappropriate. This includes links, forms, scripts, attachments, macros, or other code. VetriConn alone will determine what qualifies as spam, using data collected from Site activity."),
      p("We may interact with users to detect abuse and share findings with law enforcement or relevant third parties if necessary. VetriConn may disable accounts or limit access to its services at its sole discretion, including for using automation, bots, or scripts not explicitly approved by VetriConn."),
      p("You may not:"),
      ul(
        "Use the Site for personal profit without VetriConn’s written permission.",
        "Crawl, scrape, or mine Site data, or reproduce, duplicate, copy, sell, trade, or exploit it.",
        "Use any automation tool not expressly permitted by VetriConn.",
        "Bribe or attempt to bribe VetriConn employees to alter reviews or content. This will result in permanent removal of your organization from the platform.",
      ),

      h3("Legal Compliance and Sanctions Restrictions"),
      p("You agree to follow all applicable laws and regulations including those governing exports, re-exports, intellectual property, and digital services."),
      p("By using the Site, you confirm that you are not:"),
      ul(
        "Located in or a resident of a country outside Canada or under Canadian embargo or sanctions.",
        "Designated by the Canada government as supporting terrorism.",
        "On the Consolidated Canadian Autonomous Sanctions List.",
      ),
      p("If any of these apply to you, do not use the Site."),

      h3("External Links and Third-Party Services"),
      p("VetriConn may provide links on the Site to external websites operated by third parties (“External Sites”), including employer websites, applicant tracking systems, and promotional pages. These links may appear in User Content (such as Job Ads or Resumes). VetriConn is not responsible for the availability, content, or performance of any External Site, and such links may be removed at any time without notice. Any concerns regarding an External Site should be directed to that third party."),
      p("If you engage with an External Site, any transactions or data sharing are solely between you and the third party, and are governed by their own terms and privacy policies. VetriConn is not liable for any outcomes, payments, or issues arising from your use of External Sites."),
      p("VetriConn may also offer access to services provided by third parties (“Third-Party Services”), such as background checks. In such cases, VetriConn functions solely as a technical intermediary and does not access, store, or analyze the reports provided. By using a Third-Party Service, you enter a direct agreement with the service provider and assume all associated risks. You agree to indemnify VetriConn for any claims related to your use of these services."),
      p("Some Site features may rely on third-party APIs and are subject to those providers’ additional terms and conditions."),

      h3("Account Registration and Security"),
      p("Some areas of the Site require you to register, verify an email or phone number, or create an account. You agree to provide accurate, current, and complete information and not to create multiple or automated accounts."),
      p("VetriConn recommends enabling two-factor authentication (2FA) where available. If you choose not to enable 2FA, you accept all risks. You are responsible for safeguarding your login credentials, and any person with access to them can use your account. If your phone number changes, it may not update across all Site areas, such as your public profile."),
      p("VetriConn may alert you to security issues, such as interactions with compromised accounts. However, these notifications are not guaranteed, and VetriConn disclaims all liability for their timeliness, delivery, or accuracy."),
      p("You may choose to use a Passkey (e.g., fingerprint or facial recognition) to sign in. These are stored on your device, and VetriConn does not access any biometric data. You are solely responsible for managing Passkey settings and data."),

      h3("Communications from VetriConn"),
      p("VetriConn may contact you using the details you provide, including via your account, email, phone (including SMS), or postal mail. By providing your phone number, you confirm it is yours and consent to receiving calls and texts, including automated messages."),
      p("To stop receiving SMS messages, reply with “STOP” or contact VetriConn support. Other opt-out requests may not be recognized. Replying “STOP” applies only to that message thread; you may continue to receive messages from other services you’ve opted into. You may also unsubscribe from emails using your account settings or the unsubscribe link in VetriConn communications."),

      h3("Billing and Payments"),
      p("Charges for services are outlined on the Site or in a related agreement. By providing payment details (credit card, bank account, etc.), you authorize VetriConn to charge the relevant method for any applicable fees."),
      p("If you sign up for direct debit, you consent to EFT debits for amounts owed, until you revoke that authorization. Subscription services will auto-renew unless you cancel, and cancellation may not take effect until the next billing cycle. Pausing a subscription does not cancel it. VetriConn does not provide refunds for partially used billing cycles. Any decision to issue prorated refunds is at VetriConn’s sole discretion."),
      p("Invoices are typically delivered electronically. Unpaid balances may result in service suspension or termination, including across unrelated VetriConn products. Any billing disputes must be raised within 60 days."),
      p("Billing and payment data may be shared with trusted third parties (e.g., processors, credit agencies) for account management, payment, or legal compliance. Updated card information may be obtained through networks or issuers to process outstanding charges. If your account has a saved payment method, VetriConn may use it for future transactions unless otherwise specified."),
      p("You cannot remove the only payment method on file if you have outstanding charges."),

      h3("Change of Address and Billing Terms"),
      p("If you update your billing address from one within Canada to an address outside of Canada, your current agreement with VetriConn will remain in effect through the end of that calendar month. Starting the first day of the following month, your use of the Site will be governed by the applicable VetriConn entity relevant to your new location, as identified in the introduction to this Agreement."),
      p("If your account includes a saved payment method (e.g., credit card or bank account for EFT), VetriConn reserves the right to charge that method for any services ordered or outstanding balances, including adjustments for billing errors."),
      p("All charges are exclusive of applicable taxes and VAT. You are solely responsible for paying all taxes, government-imposed fees, and any legal costs or collection fees VetriConn incurs in recovering late payments. Any withholding tax obligations are your responsibility alone."),

      h3("Refund Policy"),
      p("Unless otherwise stated in this Agreement, VetriConn may issue refunds for services within two (2) months of the purchase date. Refunds are not available in cases of policy abuse and remain subject to VetriConn’s sole discretion."),

      h3("Limitation of Liability"),
      p("To the fullest extent permitted by law, VetriConn, its affiliates, and licensors will not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages. This includes but is not limited to loss of profits, revenue, goodwill, data, or business interruption, whether the claim is based in contract, tort (including negligence), indemnity, or any other legal theory. This limitation applies regardless of prior notification of potential damages or failure of any remedy."),
      p("This limitation applies to damages resulting from:"),
      ul(
        "Use or misuse of, or reliance on the Site",
        "Inability to access or use the Site",
        "Site interruptions or terminations",
        "Third-party services, goods, or links",
        "Replacement costs for goods or services",
      ),
      p("VetriConn’s total liability shall not exceed the amount you paid to use the Site."),

      h3("Intellectual Property and Site Use"),
      p("You acknowledge that VetriConn and its licensors retain full ownership and intellectual property rights over the Site. All rights not expressly granted are reserved. You agree not to alter copyright notices or proprietary designations on Site materials, aside from your own User Content. Derivative use, scraping, automated data collection, and framing any part of the Site are strictly prohibited."),
      p("Materials provided on the Site are subject to “Restricted Rights.” Any governmental use is subject to applicable legal restrictions and constitutes acknowledgement of VetriConn’s proprietary interests."),

      h3("Entire Agreement and Legal Terms"),
      p("This document represents the complete agreement between you and VetriConn and supersedes all prior communications and agreements. In case of conflict, Job Seeker, Employer, or Publisher-specific terms take precedence over this general Agreement."),
      p("If any provision of this Agreement is found unenforceable, it will be revised only to the extent needed to remain in effect. Use of the Site via an agency or reseller does not exempt you from these terms."),
      p("All legal notices to VetriConn must be sent to the relevant address via certified mail or overnight courier and are deemed received upon delivery. Notices to you may be sent via email or posted in your account, considered received when sent or posted."),
      p("You may not transfer your rights or obligations under this Agreement without VetriConn’s written consent. VetriConn may freely assign its rights and obligations. Nothing in this Agreement creates an employment, partnership, or agency relationship. Describing a third party as a “partner” does not imply binding authority unless agreed in writing."),
      p("The word “including” shall be interpreted as “including, but not limited to.”"),

      h3("Governing Law"),
      p("This Agreement is governed by the laws of Ontario, Canada, including all matters relating to its validity, interpretation, and performance."),
    ],
  },
  {
    id: "refund-policy",
    title: "Refund Policy for VetriConn Inc.",
    blocks: [
      p("At VetriConn, we strive to provide high-quality services for both job seekers and employers. Our goal is to ensure satisfaction with the job posting services provided. However, we understand that situations may arise where a refund is requested. Please review our refund policy below."),

      h3("1. Job Posting Refunds"),
      p("A. Eligibility for Refunds:"),
      ul(
        "Refunds are available for job postings that have not yet been viewed or accessed by job seekers.",
        "A refund will be granted if there is an error in the job posting (e.g., a technical issue prevents the job from being listed on the site).",
        "Refunds are not provided for job postings that have been successfully published and viewed by users, as they have already contributed to job seeker engagement.",
      ),
      p("B. Non-Refundable Charges:"),
      ul(
        "Service fees or processing fees charged for premium listings or featured job posts are non-refundable once the post has gone live.",
        "Any subscription-based packages (e.g., monthly, yearly) are non-refundable, but users can cancel further billing.",
      ),
      p("C. Refund Requests Process:"),
      ul(
        "Refund requests must be submitted within 7 days of purchase via our customer service email at [customer service email].",
        "Provide the Job Posting ID, the date of purchase, the reason for the refund request, and any technical issues encountered, if applicable.",
      ),

      h3("2. Cancellation of Services"),
      p("A. Cancellation of Subscriptions:"),
      ul(
        "Users can cancel subscription-based services (e.g., job posting plans) at any time before the next billing cycle.",
        "No refunds will be issued for any paid period that has already started, but the service will remain active until the end of the current billing period.",
      ),
      p("B. Early Termination of Contractual Agreements:"),
      ul(
        "For employers who have signed a contract for long-term job posting agreements, early termination may be allowed, but the refund will be pro-rated based on the unused period.",
      ),

      h3("3. Refund Processing Time"),
      ul(
        "Refunds will be processed to the original payment method used at the time of purchase within 10 to 15 business days of approval.",
        "In cases where the refund cannot be processed to the original method, an alternative arrangement will be discussed with the user.",
      ),

      h3("4. Exceptions"),
      ul(
        "No refunds will be issued for any job postings that violate the site’s Terms of Service or involve fraudulent activities.",
        "Refunds will not be issued if the job posting was removed due to failure to comply with our content guidelines or policies.",
      ),

      h3("5. Contact Information"),
      p("If you have any questions or concerns about our Refund Policy, please contact us at:"),
      ul(
        "Email: VetriConn.Inc@gmail.com",
        "Phone: [Customer Service Phone Number]",
        "Office Hours: [Hours of Operation]",
      ),

      h3("6. Changes to This Policy"),
      p("We reserve the right to update or modify this refund policy at any time. Any changes will be communicated via email and updated on this page."),
    ],
  },
];

export interface TermsHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * The flat document outline in reading order, and the id of every h3.
 *
 * Derived from TERMS_SECTIONS rather than written by hand, so a heading
 * cannot appear in the outline without existing on the page, or the other way
 * round, and the floating navigation cannot drift out of step with the text
 * it points at.
 *
 * Ids carry their section as a prefix because the document deliberately
 * repeats subheadings across its audiences: "Screening Tools", "Class Action
 * Waiver", "Indemnification" and several of the communications headings each
 * appear under more than one of A, B, C and D. Two elements sharing an id is
 * not a rendering problem, it is a navigation one: every link to that id
 * would land on whichever came first, so the employer sections would quietly
 * send readers to the job seeker text.
 *
 * The numeric suffix loop is a backstop for an exact repeat inside a single
 * section. Nothing hits it today; it is here so that adding one later changes
 * the outline rather than silently breaking two links.
 */
const { outline, h3Ids } = (() => {
  const outline: TermsHeading[] = [];
  const h3Ids: Record<string, string> = {};
  const used = new Set<string>();

  for (const section of TERMS_SECTIONS) {
    outline.push({ id: section.id, text: section.title, level: 2 });
    used.add(section.id);

    section.blocks.forEach((block, index) => {
      if (block.kind !== "h3") return;

      const base = `${section.id}-${slugify(block.text)}`;
      let id = base;
      for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;

      used.add(id);
      h3Ids[`${section.id}:${index}`] = id;
      outline.push({ id, text: block.text, level: 3 });
    });
  }

  return { outline, h3Ids };
})();

export const TERMS_OUTLINE: readonly TermsHeading[] = outline;

/** Keyed `${section.id}:${blockIndex}`, so the page can label an h3 as it renders it. */
export const TERMS_H3_IDS: Readonly<Record<string, string>> = h3Ids;
